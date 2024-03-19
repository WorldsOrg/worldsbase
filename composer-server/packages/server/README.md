## ⚡Quick Start

1. Install MongoDB [locally](https://www.mongodb.com/docs/manual/administration/install-community/) OR follow the guide of using MongoDB Atlas [here](https://docs.outerbridge.io/get-started#mongodb-atlas)
2. Install Outerbridge
    ```bash
    npm install -g outerbridge
    ```
3. Start Outerbridge

    ```bash
    npx outerbridge start
    ```

    If using MongoDB Atlas

    ```bash
    npx outerbridge start --mongourl=mongodb+srv://<user>:<password>@<your-cluster>.mongodb.net/outerbridge?retryWrites=true&w=majority
    ```

4. Open [http://localhost:3000](http://localhost:3000)

## 📄 License

Source code in this repository is made available under the [Apache License Version 2.0](https://github.com/Outerbridgeio/Outerbridge/blob/master/LICENSE.md).
