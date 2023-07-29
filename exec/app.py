from flask import Flask, request, jsonify, make_response
import subprocess
import shlex
import uuid
import os

app = Flask(__name__)

languages = {
    "python": {
        "interpreter": "python3",
        "extension": ".py",
        "env_code": 'import os, json\nadjacencyList = json.loads(os.getenv("ADJACENCY_LIST", "[]"))\n',
    },
    "javascript": {
        "interpreter": "node",
        "extension": ".js",
        "env_code": 'let adjacencyList = JSON.parse(process.env.ADJACENCY_LIST || "[]");\n',
    },
    "java": {
        "interpreter": "javac",
        "extension": ".java",
        # java doesn't work need to parse in the env var
        "env_code": "",
    },
    "c": {
        "interpreter": "gcc",
        "extension": ".c",
        "env_code": "",  # Parsing JSON in C is non-trivial and would require a library like cJSON.
    },
    "c++": {
        "interpreter": "g++",
        "extension": ".cpp",
        "env_code": "",  # Parsing JSON in C++ is non-trivial and would require a library like nlohmann/json.
    },
    "ruby": {
        "interpreter": "ruby",
        "extension": ".rb",
        "env_code": 'require "json"\nadjacencyList = JSON.parse(ENV["ADJACENCY_LIST"] || "[]")\n',
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


# @app.route("/run", methods=["OPTIONS"])
# def cors():
#     request.headers["Access-Control-Allow-Origin"] = "*"
#     request.headers["Access-Control-Allow-Headers"] = "*"
#     request.headers["Access-Control-Allow-Methods"] = "*"
#     request.status = 200
#     return {
#         "msg": "added cors",
#     }


@app.route("/run", methods=["POST", "OPTIONS"])
def run_code():
    if request.method == "OPTIONS":
        return make_response(("Allowed", 204))
    print("runnin code")
    data = request.get_json()
    lang = data.get("lang")
    code = data.get("code")
    env = data.get("env")
    # print("fo sho runniiing")
    # print(data, lang, code, env)

    if lang not in languages:
        print("unfortunate")
        return jsonify({"error": "Unsupported language"}), 400

    # Generate a random name for the file
    filename = "/tmp/code" + str(uuid.uuid4()) + languages[lang]["extension"]

    with open(filename, "w") as file:
        file.write(languages[lang]["env_code"] + code)
    print("wrote file")
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
            # For interpreted languages, we can run directly
            run_command = f"{interpreter} {filename}"

        # Run the code, with a 5-second timeout
        print("the env", env)
        result = subprocess.run(
            shlex.split(run_command),
            timeout=2,
            capture_output=True,
            env=env,
        )

        output = result.stdout.decode()
        print("thedecoded result", output)
    except Exception as e:
        output = str(e)
    print(
        f"output ->{output}<-",
    )
    return jsonify({"output": output})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
