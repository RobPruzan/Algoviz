from flask import Flask, request, jsonify
import subprocess
import shlex
import uuid
import os

app = Flask(__name__)

languages = {
    "python": {"interpreter": "python3", "extension": ".py"},
    "javascript": {"interpreter": "node", "extension": ".js"},
    "java": {"interpreter": "javac", "extension": ".java"},
    "c": {"interpreter": "gcc", "extension": ".c"},
    "c++": {"interpreter": "g++", "extension": ".cpp"},
    "ruby": {"interpreter": "ruby", "extension": ".rb"},
    "rust": {"interpreter": "rustc", "extension": ".rs"},
    "go": {"interpreter": "go", "extension": ".go"},
}


@app.route("/run", methods=["POST"])
def run_code():
    print("runnin code")
    data = request.get_json()
    lang = data.get("lang")
    code = data.get("code")

    if lang not in languages:
        return jsonify({"error": "Unsupported language"}), 400

    # Generate a random name for the file
    filename = "/tmp/code" + str(uuid.uuid4()) + languages[lang]["extension"]

    with open(filename, "w") as file:
        file.write(code)

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
        result = subprocess.run(
            shlex.split(run_command), timeout=2, capture_output=True
        )
        output = result.stdout.decode()
    except Exception as e:
        output = str(e)

    return jsonify({"output": output})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
