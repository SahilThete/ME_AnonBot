# ME_AnonBot

ME_AnonBot is a Discord bot tailored for **roleplay communities**, allowing players to interact anonymously under custom aliases in a designated "dark web" channel. This bot enhances immersion by enabling anonymous messaging tied to unique handles.

## **Features**

- 🕵️ **Create Anonymous Handles**: Generate unique anonymous IDs like `anon1234` to interact without exposing your identity.
- 💬 **Send Anonymous Messages**: Deliver messages through your alias in the configured dark web channel.
- 🔒 **Admin Control**: Manage access, designated channels, and user handles with admin commands.
- 🤖 **User-Friendly Interface**: Slash commands simplify anonymous interaction.

## **Commands**

### General Commands
- **`/ping`**: Check the bot’s latency.
- **`/create`**: Create a custom anonymous handle (e.g., `anonXXXX`).
- **`/viewhandle`**: View your current anonymous handle.
- **`!anon <message>`**: Send an anonymous message in the designated channel.
- **`/help`**: Get a list of available commands.

### Admin Commands
- **`/setchannel`**: Set the dark web conversation channel (admin-only).
- **`/admin viewhandles`**: View all anonymous handles.
- **`/admin manage`**: Add or remove admin users.

## **Getting Started**

### **Prerequisites**
- [Node.js](https://nodejs.org/) (version 16 or higher).
- [MongoDB](https://www.mongodb.com/) (to store user handles and configurations).
- A Discord bot token (from the [Discord Developer Portal](https://discord.com/developers/applications)).

### **Installation**
1. **Clone the repository**:
    ```bash
    git clone https://github.com/SahilThete/ME_AnonBot.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd ME_AnonBot
    ```
3. **Install dependencies**:
    ```bash
    npm install
    ```
4. **Configure your environment variables**:
    - Create a `.env` file in the root directory.
    - Add the following:
      ```
      BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
      MONGODB_URI=YOUR_MONGODB_URI
      ```
5. **Start the bot**:
    ```bash
    node bot.js
    ```

### **Troubleshooting**
- **MongoDB connection errors**: Ensure MongoDB is running and the URI in `.env` is correct.
- **Permissions issues**: Make sure the bot has sufficient permissions (e.g., manage channels, read/write messages).
- **Missing dark web channel**:
  - Use `/setchannel` to configure a text channel for anonymous messaging.
- **Handle creation problems**:
  - Follow the required format (`anonXXXX` where `XXXX` is a 4-digit number).
  - Ensure the handle isn’t already taken.

---

## **Use Cases**
- **Roleplay Communities**: Enhance player immersion with anonymous interactions.
- **Anonymous Feedback**: Collect unfiltered suggestions in server communities.
- **Secret Storylines**: Use anonymous handles for dramatic storytelling in roleplay.

## **Contributing**

Contributions are welcome! If you have suggestions, create a pull request or submit an issue in the repository.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## **Acknowledgments**
- ❤️ **Discord.js**: For the framework enabling interaction with the Discord API.
- 🗃️ **MongoDB**: For seamless database management.
- 💡 **Community Feedback**: Inspiration from roleplay enthusiasts and Discord server admins.
