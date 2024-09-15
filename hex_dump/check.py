import asyncio
import re
from pexpect import EOF, TIMEOUT, spawn

class Simulator:
    def __init__(self):
        self.spike_process = None
    
    def parse_registers(input_str):
    # Use regex to extract register names and values
        pattern = r'(\w+):\s+(0x[0-9a-fA-F]+)'
        matches = re.findall(pattern, input_str)

        # Create a dictionary with register names as keys and values as values
        register_dict = [int(value, 16) for _, value in matches]
        return register_dict

    async def start(self):
        if self.spike_process:
            self.terminate()  # Terminate the previous process if it's running
        
        command = '/home/abdulrehman/Desktop/oxygen/tools/spike/bin/spike -d --isa=rv32im /home/abdulrehman/Desktop/oxygen/tools/spike/bin/elf'
        self.spike_process = spawn(command)
        await asyncio.sleep(0.1)
        # Clear initial output
        self.spike_process.expect(['(spike)', TIMEOUT, EOF])

    def terminate(self):
        """Terminate the current Spike process if it is running."""
        if self.spike_process:
            self.spike_process.terminate(force=True)  # Terminate the running process
            self.spike_process = None

    async def step(self):
        if not self.spike_process:
            return "Simulator not started"
        
        self.spike_process.sendline('')
        try:
            index = self.spike_process.expect(['(spike)', TIMEOUT, EOF])
            if index == 0:  # Matched '(spike)'
                output = self.spike_process.before.decode('utf-8').strip()
                return output
            elif index == 1:  # TIMEOUT
                return "Timeout occurred"
            else:  # EOF
                return "Simulation ended"
        except EOF:
            return "Simulation ended unexpectedly"

    async def get_registers(self):
        if not self.spike_process:
            return "Simulator not started"
        
        self.spike_process.sendline('reg 0')
        try:
            register_pattern = r'zero:.*\n(.*\n){7}\(spike\)'
            index = self.spike_process.expect([register_pattern, TIMEOUT, EOF])
            if index == 0:  # Matched '(spike)'
                output = self.spike_process.after.decode('utf-8').strip()
                return self.parse_registers(output)
            elif index == 1:  # TIMEOUT
                return "Timeout occurred"
            else:  # EOF
                return "Simulation ended"
        except EOF:
            return "Simulation ended unexpectedly"