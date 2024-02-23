import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'

class MintNFT implements INode {
    label: string
    name: string
    type: NodeType
    description: string
    version: number
    icon: string
    incoming: number
    outgoing: number
    category: string
    inputParameters?: INodeParams[]

    constructor() {
        this.label = 'Mint NFT'
        this.name = 'MintNFT'
        this.icon = 'eth.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Mint NFT (ERC1155) to a user wallet'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'NFT'
        this.inputParameters = [
            {
                label: 'Wallet Address',
                name: 'wallet',
                type: 'string',
                description: 'Wallet Address'
            },
            {
                label: 'Contract Address',
                name: 'contract',
                type: 'string',
                description: 'Admin Password'
            },
            {
                label: 'Token Id',
                name: 'tokenId',
                type: 'number',
                description: 'Tokens have an ID that corresponds to the contract they are on'
            },
            {
                label: 'Amount',
                name: 'amount',
                type: 'number',
                description: 'The amount of tokens to be minted'
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const walletAddress = inputParametersData.wallet as string
        const contractAddress = inputParametersData.contract as string
        const tokenId = inputParametersData.tokenId
        const amount = inputParametersData.amount

        const returnData: ICommonObject[] = []
        let responseData: any
        let url = `https://thirdwebserver-production-4137.up.railway.app/mintto`

        const axiosConfig: AxiosRequestConfig = {
            method: 'POST' as Method,
            url,
            headers: { 'Content-Type': 'application/json' },
            data: {
                address: contractAddress,
                tokenId: tokenId,
                to: walletAddress,
                amount: amount
            }
        }
        const response = await axios(axiosConfig)
        responseData = response.data

        if (Array.isArray(responseData)) returnData.push(...responseData)
        else returnData.push(responseData)

        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: MintNFT }
