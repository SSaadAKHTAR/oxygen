import re

# Define the formats for each type of instruction
FORMATS = {
    'R': '{funct7:07}{rs2:05}{rs1:05}{funct3:03}{rd:05}{opcode:07}',
    'I': '{imm:012}{rs1:05}{funct3:03}{rd:05}{opcode:07}',
    'S': '{imm_11_5:07}{rs2:05}{rs1:05}{funct3:03}{imm_4_0:05}{opcode:07}',
    'B': '{imm_12}{imm_10_5:06}{rs2:05}{rs1:05}{funct3:03}{imm_4_1:04}{imm_11}{opcode:07}',
    'U': '{imm:020}{rd:05}{opcode:07}',
    'J': '{imm_20}{imm_10_1:010}{imm_11}{imm_19_12:08}{rd:05}{opcode:07}',
}

# Define the opcode, funct3, and funct7 for each instruction
INSTRUCTION_SET = {
    'add':  ('0110011', '000', '0000000', 'R'),
    'sub':  ('0110011', '000', '0100000', 'R'),
    'xor':  ('0110011', '100', '0000000', 'R'),
    'or':   ('0110011', '110', '0000000', 'R'),
    'and':  ('0110011', '111', '0000000', 'R'),
    'sll':  ('0110011', '001', '0000000', 'R'),
    'srl':  ('0110011', '101', '0000000', 'R'),
    'sra':  ('0110011', '101', '0100000', 'R'),
    'addi': ('0010011', '000', None, 'I'),
    'xori': ('0010011', '100', None, 'I'),
    'ori':  ('0010011', '110', None, 'I'),
    'andi': ('0010011', '111', None, 'I'),
    'lb':   ('0000011', '000', None, 'I'),
    'lh':   ('0000011', '001', None, 'I'),
    'lw':   ('0000011', '010', None, 'I'),
    'lbu':  ('0000011', '100', None, 'I'),
    'lhu':  ('0000011', '101', None, 'I'),
    'sb':   ('0100011', '000', None, 'S'),
    'sh':   ('0100011', '001', None, 'S'),
    'sw':   ('0100011', '010', None, 'S'),
    'beq':  ('1100011', '000', None, 'B'),
    'bne':  ('1100011', '001', None, 'B'),
    'blt':  ('1100011', '100', None, 'B'),
    'bge':  ('1100011', '101', None, 'B'),
    'bltu': ('1100011', '110', None, 'B'),
    'bgeu': ('1100011', '111', None, 'B'),
    'jal':  ('1101111', None, None, 'J'),
    'jalr': ('1100111', '000', None, 'I'),
    'lui':  ('0110111', None, None, 'U'),
    'auipc':('0010111', None, None, 'U'),
    'ecall':('1110011', '000', '0000000', 'I'),
    'ebreak':('1110011', '000', '0000001', 'I'),
}

def register_to_bin(register):
    """Convert register name to binary representation"""
    if register.startswith('x'):
        x = int(register[1:])
        x = '{0:05b}'.format(x)
        
        return x
        # return int(register[1:])
    raise ValueError(f"Unknown register: {register}")

def imm_to_bin(imm, length):
    """Convert immediate value to binary representation of given length"""
    value = int(imm)
    if value < 0:
        value = (1 << length) + value
    return format(value, f'0{length}b')


def parse_instruction(instruction):
    """Parse the instruction into its binary components"""
    parts = re.split(r'\s|,', instruction.strip())
    inst_name = parts[0]
    opcode, funct3, funct7, inst_type = INSTRUCTION_SET[inst_name]
    
    if inst_type == 'R':
        rd = register_to_bin(parts[1])
        rs1 = register_to_bin(parts[2])
        rs2 = register_to_bin(parts[3])
        return FORMATS['R'].format(funct7, s2=rs2, rs1=rs1, funct3=funct3, rd=rd, opcode=opcode)
    
    elif inst_type == 'I':
        print(parts)
        rd = register_to_bin(parts[1])
        rs1 = register_to_bin(parts[2])
        imm = imm_to_bin(parts[3], 12)
        # return '{imm:012}{rs1:05}{funct3:03}{rd:05}{opcode:07}'.format(imm=imm, rs1=rs1, funct3=funct3, rd=rd, opcode=opcode)
        print (FORMATS['I'].format(imm=imm, rs1=rs1, funct3=funct3, rd=rd, opcode=opcode))
        return FORMATS['I'].format(imm=imm, rs1=rs1, funct3=funct3, rd=rd, opcode=opcode)
    
    elif inst_type == 'S':
        rs1 = register_to_bin(parts[1])
        rs2 = register_to_bin(parts[2])
        imm = imm_to_bin(parts[3], 12)
        imm_11_5 = imm[:7]
        imm_4_0 = imm[7:]
        return FORMATS['S'].format(imm_11_5=imm_11_5, rs2=rs2, rs1=rs1, funct3=funct3, imm_4_0=imm_4_0, opcode=opcode)
    
    elif inst_type == 'B':
        rs1 = register_to_bin(parts[1])
        rs2 = register_to_bin(parts[2])
        
        # imm_bin = format(int(imm), '013b')
        # imm_bin2 = ''.join(reversed(str(imm_bin)))
        # imm12 = imm_bin2[12]
        # imm10_5 = imm_bin2[5:11]
        # imm4_1 = imm_bin2[1:5]
        # imm11 = imm_bin2[11]
        # binary_str = f"{imm12}{imm10_5}{rs2_bin}{rs1_bin}{funct3}{imm4_1}{imm11}{opcode}"
        
        
        imm_bin = imm_to_bin(parts[3], 13)
        
        imm_bin2 = ''.join(reversed(str(imm_bin)))
        imm_12 = imm_bin2[12]
        imm_10_5 = imm_bin2[5:11]
        imm_4_1 = imm_bin2[1:5]
        imm_11 = imm_bin2[11]
        # imm_12 = imm[0]
        # imm_10_5 = imm[1:7]
        # imm_4_1 = imm[7:11]
        # imm_11 = imm[11]
        return FORMATS['B'].format(imm_12=imm_12, imm_10_5=imm_10_5, rs2=rs2, rs1=rs1, funct3=funct3, imm_4_1=imm_4_1, imm_11=imm_11, opcode=opcode)
    
    elif inst_type == 'U':
        rd = register_to_bin(parts[1])
        imm = imm_to_bin(parts[2], 20)
        return FORMATS['U'].format(imm=imm, rd=rd, opcode=opcode)
    
    elif inst_type == 'J':
        rd = register_to_bin(parts[1])
        print("imm no bin " ,parts[2])
        imm = imm_to_bin(parts[2], 21)
        # imm = ''.join(reversed(str(imm)))
        imm_20 = imm[1]
        imm_10_1 = imm[10:20]
        print("imm 10_1 :",imm_10_1)
        imm_11 = imm[11]
        imm_19_12 = imm[12:20]
        print("bin imm " ,imm)
        
        print("imm broken : ",imm_20,imm_10_1,imm_11,imm_19_12,rd,opcode, end=" ")
        return FORMATS['J'].format(imm_20=imm_20, imm_10_1=imm_10_1, imm_11=imm_11, imm_19_12=imm_19_12, rd=rd, opcode=opcode)

def convert_to_hex(bin_str):
    """Convert binary string to hexadecimal"""
    print(bin_str)
    hex_str = hex(int(bin_str, 2))[2:].zfill(8)
    return hex_str

def main(input_file, output_file):
    with open(input_file, 'r') as file:
        instructions = file.readlines()
    
    with open(output_file, 'w') as file:
        for instruction in instructions:
            bin_str = parse_instruction(instruction)
            hex_str = convert_to_hex(bin_str)
            file.write(hex_str + '\n')

if __name__ == '__main__':
    input_file = 'oxygen\instructions.txt'
    output_file = 'instructions_hex.txt'
    main(input_file, output_file)