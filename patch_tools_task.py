import os
import re

roots = [
    r"d:\Essential-Logic\EL-ohif-viewers\node_modules\@cornerstonejs\tools\dist\esm\tools",
    r"d:\Essential-Logic\EL-ohif-viewers\modes\custom-viewer\node_modules\@cornerstonejs\tools\dist\esm\tools"
]

def patch_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    original_content = content

    # Case 1: data.cachedStats[targetId] -> safe guard
    # We use regex to handle whitespace variations
    content = re.sub(
        r"const cachedVolumeStats = data\.cachedStats\[targetId\];",
        r"const cachedVolumeStats = data?.cachedStats?.[targetId];\n    if (!cachedVolumeStats) {\n        return [];\n    }",
        content
    )
    
    # Case 2: data.cachedStats.statistics -> safe guard
    content = re.sub(
        r"const cachedVolumeStats = data\.cachedStats\.statistics;",
        r"const cachedVolumeStats = data.cachedStats?.statistics;\n    if (!cachedVolumeStats) {\n        return [];\n    }",
        content
    )

    # Case 3: data.cachedStats?.[targetId] (partially patched) -> add early return
    # This matches my previous manual patches that might be missing the early return logic
    content = re.sub(
        r"const cachedVolumeStats = data\.cachedStats\?\.\[targetId\];(?!.*if \(!cachedVolumeStats\))",
        r"const cachedVolumeStats = data?.cachedStats?.[targetId];\n    if (!cachedVolumeStats) {\n        return [];\n    }",
        content,
        flags=re.DOTALL
    )
    
    # Unified guard if targetId is already optional but missing return
    if "const cachedVolumeStats = data?.cachedStats?.[targetId];" in content and "if (!cachedVolumeStats)" not in content:
         content = content.replace(
            "const cachedVolumeStats = data?.cachedStats?.[targetId];",
            "const cachedVolumeStats = data?.cachedStats?.[targetId];\n    if (!cachedVolumeStats) {\n        return [];\n    }"
         )

    if content != original_content:
        try:
            with open(filepath, 'w', encoding='utf8') as f:
                f.write(content)
            print(f"Patched: {filepath}")
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

for root in roots:
    print(f"Checking root: {root}")
    if not os.path.exists(root):
        print(f"Root not found: {root}")
        continue
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if filename.endswith(".js"):
                patch_file(os.path.join(dirpath, filename))

print("Patching complete.")
