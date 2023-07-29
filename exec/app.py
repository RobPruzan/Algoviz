import json
from flask import Flask, request, jsonify, make_response
import subprocess
import shlex
import uuid
import os

app = Flask(__name__)
parse_var = "\P"


def parse_output(out: str):
    pre = [""]
    post = [""]
    print("full stdout", out)
    for idx in range(len(out)):
        if idx == len(out):
            return
        if out[idx : idx + 2] == parse_var:
            pre[0] = out[:idx]
            post[0] = out[idx + 2 :]
            return pre[0], post[0]
    return pre[0], post[0]


languages = {
    "python": {
        "interpreter": "python3",
        "extension": ".py",
        "env_code": 'import os, json\nadjacencyList = json.loads(os.getenv("ADJACENCY_LIST", "[]"))\n',
        "call_code": "\nout = json.dumps(algorithm(adjacencyList))"
        + "\n"
        + f"print('{parse_var}')"
        + "\n"
        + "print(json.dumps(out))",
    },
    "javascript": {
        "interpreter": "node",
        "extension": ".js",
        "env_code": 'let adjacencyList = JSON.parse(process.env.ADJACENCY_LIST || "[]");\n',
        "call_code": "\n"
        + "console.log(process.env.ADJACENCY_LIST);"
        + "const out = JSON.stringify(algorithm(adjacencyList));"
        + "\n"
        + f"console.log('{parse_var}')"
        + "\n"
        + "console.log(out)",
    },
    "java": {
        "interpreter": "javac",
        "extension": ".java",
        # java doesn't work need to parse in the env var
        "env_code": "",
    },
    "rust": {
        "interpreter": "rustc",
        "extension": ".rs",
        "env_code": "",  # Parsing JSON in Rust is non-trivial and would require a library like serde_json.
    },
    "go": {
        "interpreter": "go",
        "extension": ".go",
        "env_code": 'import "encoding/json"\nvar adjacencyList []string\njson.Unmarshal([]byte(os.Getenv("ADJACENCY_LIST")), &adjacencyList)\n',
        "call_code": "\n"
        + "out, _ := json.Marshal(algorithm(adjacencyList))"
        + "\n"
        + f'fmt.Println("{parse_var}")'
        + "\n"
        + "fmt.Println(string(out))",
    },
}


@app.after_request
def add_cors_headers(response):
    print("got response")
    response.headers.add("Access-Control-Allow-Origin", "*")
    if request.method == "OPTIONS":
        response.headers["Access-Control-Allow-Methods"] = "POST"
        headers = request.headers.get("Access-Control-Request-Headers")
        if headers:
            response.headers["Access-Control-Allow-Headers"] = headers
    return response


@app.route("/run", methods=["POST", "OPTIONS"])
def run_code():
    if request.method == "OPTIONS":
        return make_response(("Allowed", 204))
    data = request.get_json()
    lang = data.get("lang")
    code = data.get("code")
    env = data.get("env")
    # print("fo sho runniiing")
    # print(data, lang, code, env)

    if lang not in languages:
        return jsonify({"error": "Unsupported language"}), 400

    # Generate a random name for the file
    filename = "/tmp/code" + str(uuid.uuid4()) + languages[lang]["extension"]

    with open(filename, "w") as file:
        file.write(languages[lang]["env_code"] + code + languages[lang]["call_code"])

    try:
        interpreter = languages[lang]["interpreter"]
        if lang in ["c", "c++", "rust"]:
            # For compiled languages, we need to compile first, then execute
            compile_command = f"{interpreter} {filename} -o {filename}.out"
            subprocess.run(shlex.split(compile_command), check=True)
            run_command = f"./{filename}.out"
        elif lang == "java":
            # Java needs special treatment because of the way javac works
            compile_command = f"{interpreter} {filename}"
            subprocess.run(shlex.split(compile_command), check=True)
            run_command = (
                f"java -cp /tmp {os.path.splitext(os.path.basename(filename))[0]}"
            )
        else:
            run_command = f"{interpreter} {filename}"

        # print("the code", code)
        result = subprocess.run(
            shlex.split(run_command),
            timeout=2,
            capture_output=True,
            env=env,
        )

        stdout = result.stdout.decode()
        stderr = result.stderr.decode()
        output = stdout if not stderr else stderr
    except Exception as e:
        output = str(e)
    logs, out = parse_output(output)
    # print("before parsing", out)
    out = json.loads(json.loads(out))
    # print("typof", type(out))

    logs = logs if logs else ""

    print("logs", logs)

    if stderr:
        return jsonify({"output": out, "logs": logs, "type": "error"})

    return jsonify({"output": out, "logs": logs})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6969, debug=True)
