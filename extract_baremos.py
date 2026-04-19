#!/usr/bin/env python3
"""Extract baremos (percentile tables) from all Razonamiento portable exes"""
import marshal, sys, dis, json
sys.stdout.reconfigure(encoding='utf-8')

base = 'C:/Users/Mi Pc/OneDrive/TODOS LOS DOCUMENTOS/Documentos/1APROVA MASTER/portables/APROVA RAZONAMIENTO'

tests = {
    'verbal': base + '/APROVA_Razonamiento_Verbal.exe_extracted/aprova_verbal.pyc',
    'numerico': 'C:/Users/Mi Pc/AppData/Local/Temp/APROVA_Razonamiento_Numerico.exe_extracted/aprova_numerico.pyc',
    'abstracto': base + '/APROVA_Razonamiento_Abstracto.exe_extracted/aprova_abstracto.pyc',
    'mecanico': base + '/APROVA_Razonamiento_Mecanico.exe_extracted/aprova_mecanico.pyc',
    'espacial': base + '/APROVA_Relaciones_Espaciales.exe_extracted/aprova_espacial.pyc',
    'ortografia': base + '/APROVA_Ortografia.exe_extracted/aprova_ortografia.pyc',
    'perceptiva': base + '/APROVA_Rapidez_Perceptiva.exe_extracted/aprova_rapidez_perceptiva.pyc',
}

def load_pyc(path):
    with open(path, 'rb') as f:
        f.read(16)
        return marshal.loads(f.read())

def find_code(code_obj, name):
    for const in code_obj.co_consts:
        if hasattr(const, 'co_name') and const.co_name == name:
            return const
        if hasattr(const, 'co_consts'):
            result = find_code(const, name)
            if result:
                return result
    return None

def extract_baremos(code):
    """Extract baremos by simulating the bytecode stack operations.

    Pattern per table:
    1. BUILD_MAP(0) → start high-PD map
    2. LOAD_CONST(pd), LOAD_CONST(centil), MAP_ADD pairs
    3. BUILD_MAP(0) → start low-PD map
    4. LOAD_CONST(pd), LOAD_CONST(centil), MAP_ADD pairs
    5. DICT_UPDATE → merge low into high = complete PD->centil table
    6. BUILD_CONST_KEY_MAP(7) with tuple (6,5,4,3,2,1,0) → add remaining PDs with centil=1
    7. DICT_UPDATE → merge remainders into table

    Then BUILD_CONST_KEY_MAP(2) with ('V','M') groups two tables
    Then BUILD_CONST_KEY_MAP(3) with ('4ESO','1BACH','2BACH') groups three pairs
    """
    cb = find_code(code, 'cargar_baremos')
    if not cb:
        return None

    instructions = list(dis.get_instructions(cb))
    consts = cb.co_consts

    # Simple stack-based simulation
    stack = []

    for i, instr in enumerate(instructions):
        if instr.opname == 'RESUME':
            continue
        elif instr.opname == 'LOAD_CONST':
            stack.append(instr.argval)
        elif instr.opname == 'BUILD_MAP':
            if instr.argval == 0:
                stack.append({})
            else:
                # BUILD_MAP(n) - pop n key-value pairs
                d = {}
                for _ in range(instr.argval):
                    v = stack.pop()
                    k = stack.pop()
                    d[k] = v
                stack.append(d)
        elif instr.opname == 'MAP_ADD':
            # MAP_ADD(i) - TOS is value, TOS1 is key, add to map at stack[-(i+1)]
            v = stack.pop()
            k = stack.pop()
            # The map is at -(i) in the stack (1-indexed from top before pop)
            map_idx = -(instr.argval)
            if isinstance(stack[map_idx], dict):
                stack[map_idx][k] = v
        elif instr.opname == 'DICT_UPDATE':
            # DICT_UPDATE(i) - merge TOS into stack[-i]
            update_dict = stack.pop()
            target_idx = -(instr.argval)
            if isinstance(stack[target_idx], dict) and isinstance(update_dict, dict):
                stack[target_idx].update(update_dict)
        elif instr.opname == 'DICT_MERGE':
            update_dict = stack.pop()
            target_idx = -(instr.argval)
            if isinstance(stack[target_idx], dict) and isinstance(update_dict, dict):
                stack[target_idx].update(update_dict)
        elif instr.opname == 'BUILD_CONST_KEY_MAP':
            keys = stack.pop()  # tuple of keys
            n = instr.argval
            values = []
            for _ in range(n):
                values.insert(0, stack.pop())
            d = dict(zip(keys, values))
            stack.append(d)
        elif instr.opname == 'STORE_FAST':
            if instr.argval == 'baremos':
                # This is the final result
                return stack.pop() if stack else None
        elif instr.opname == 'LOAD_FAST':
            # Just for the return, skip
            pass
        elif instr.opname == 'RETURN_VALUE':
            pass
        # Ignore other instructions

    # If we get here, try the top of stack
    return stack[-1] if stack and isinstance(stack[-1], dict) else None

all_baremos = {}

for test_name, path in tests.items():
    print(f'\n=== {test_name.upper()} ===')
    code = load_pyc(path)
    baremos = extract_baremos(code)

    if baremos:
        all_baremos[test_name] = baremos
        # Show structure
        for nivel, sexos in baremos.items():
            if isinstance(sexos, dict):
                for sexo, table in sexos.items():
                    if isinstance(table, dict):
                        pds = sorted(table.keys(), reverse=True) if table else []
                        if pds:
                            print(f'  {nivel}/{sexo}: {len(table)} entries, PD {min(pds)}-{max(pds)}, centil {min(table.values())}-{max(table.values())}')
    else:
        print(f'  No baremos found')

# Convert to flat format for JSON: test -> "V_4ESO" -> {pd: centil}
json_baremos = {}
for test, baremos in all_baremos.items():
    json_baremos[test] = {}
    for nivel, sexos in baremos.items():
        if isinstance(sexos, dict):
            for sexo, table in sexos.items():
                if isinstance(table, dict):
                    key = f'{sexo}_{nivel}'
                    json_baremos[test][key] = {str(k): v for k, v in sorted(table.items())}

output_path = 'C:/Users/Mi Pc/OneDrive/Escritorio/PaginaAprova/aprova-react/src/data/baremos_razonamiento.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(json_baremos, f, ensure_ascii=False, indent=2)

print(f'\n\nBaremos saved to {output_path}')
