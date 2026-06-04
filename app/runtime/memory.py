class MemoryStore:

    def __init__(self):

        self.memory = {}

    def save(
        self,
        user_id,
        message
    ):

        if user_id not in self.memory:

            self.memory[user_id] = []

        self.memory[user_id].append(message)

    def get(
        self,
        user_id
    ):

        return self.memory.get(
            user_id,
            []
        )


memory_store = MemoryStore()