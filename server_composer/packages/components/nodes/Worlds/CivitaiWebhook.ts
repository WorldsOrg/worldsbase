import { ICommonObject, INode, INodeData, IWebhookNodeExecutionData, NodeType } from '../../src/Interface'
import { compareKeys, returnWebhookNodeExecutionData } from '../../src/utils'

class Webhook implements INode {
    label: string
    name: string
    type: NodeType
    description?: string
    version: number
    icon: string
    category: string
    incoming: number
    outgoing: number

    constructor() {
        this.label = 'Post Detected'
        this.icon = 'civitai.png'
        this.name = 'webhook_civitai'
        this.type = 'webhook'
        this.category = 'Other'
        this.version = 2.0
        this.description = 'Start workflow when new post detected'
        this.incoming = 0
        this.outgoing = 1
    }

    async runWebhook(nodeData: INodeData): Promise<IWebhookNodeExecutionData[] | null> {
        const req = nodeData.req

        if (req === undefined) {
            throw new Error('Missing request')
        }

        const responseData = ''
        const authorization = 'headerAuth'
        const apiSecret = process.env.API_SERCRET || ''

        const returnData: ICommonObject[] = []

        if (authorization === 'headerAuth') {
            let suppliedKey = ''
            if (req.headers['X-API-KEY']) suppliedKey = req.headers['X-API-KEY'] as string
            if (req.headers['x-api-key']) suppliedKey = req.headers['x-api-key'] as string
            if (!suppliedKey) throw new Error('401: Missing API Key')
            const isKeyValid = compareKeys(apiSecret, suppliedKey)
            if (!isKeyValid) throw new Error('403: Unauthorized API Key')
        }

        returnData.push({
            headers: req?.headers,
            params: req?.params,
            query: req?.query,
            body: req?.body,
            rawBody: (req as any).rawBody,
            url: req?.url
        })

        return returnWebhookNodeExecutionData(returnData, responseData)
    }
}

module.exports = { nodeClass: Webhook }
