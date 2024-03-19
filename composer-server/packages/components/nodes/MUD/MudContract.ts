import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import { ethers } from 'ethers'
import { abi } from './abi/abi'

class MudContract implements INode {
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
        this.label = 'MUD Wtf Match History'
        this.name = 'MudContract'
        this.icon = 'cat.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Add match to MUD Wtf Match History table'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'Utilities'
        this.inputParameters = [
            {
                label: 'id',
                name: 'id',
                type: 'number',
                default: '',
                description: 'id of match row to insert'
            },
            {
                label: 'player_1_kills',
                name: 'player_1_kills',
                type: 'number',
                default: '',
                description: 'player 1 kills'
            },
            {
                label: 'player_1_deaths',
                name: 'player_1_deaths',
                type: 'number',
                default: '',
                description: 'player 1 deaths'
            },
            {
                label: 'player_2_kills',
                name: 'player_2_kills',
                type: 'number',
                default: '',
                description: 'player 2 kills'
            },
            {
                label: 'player_2_deaths',
                name: 'player_2_deaths',
                type: 'number',
                default: '',
                description: 'player 2 deaths'
            },
            {
                label: 'played_at',
                name: 'played_at',
                type: 'string',
                default: '',
                description: 'match played at'
            },
            {
                label: 'winner',
                name: 'winner',
                type: 'string',
                default: '',
                description: 'winner of the match'
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const id = inputParametersData.id
        const player1Kills = inputParametersData.player_1_kills
        const player1Deaths = inputParametersData.player_1_deaths
        const player2Kills = inputParametersData.player_2_kills
        const player2Deaths = inputParametersData.player_2_deaths
        const playedAt = inputParametersData.played_at
        const winner = inputParametersData.winner

        // Custom RPC URL and Chain ID for MUD
        const customRpcUrl = 'https://rpc.holesky.redstone.xyz'
        const customChainId = 17001

        // Create a provider using the custom RPC URL and chain ID
        // @ts-ignore
        const provider = new ethers.providers.JsonRpcProvider(customRpcUrl, { chainId: customChainId })
        // @ts-ignore
        const wallet = new ethers.Wallet(process.env.MUD_PRIVATE_KEY, provider)
        const contract = new ethers.Contract('0xd7a79470f26038b0d911241a719e6ec987eec1c7', abi, wallet)
        const tx = await contract.addMatch(id, player1Kills, player1Deaths, player2Kills, player2Deaths, playedAt, winner)

        const returnData: ICommonObject[] = []
        let responseData: any = tx

        if (Array.isArray(responseData)) returnData.push(...responseData)
        else returnData.push(responseData)

        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: MudContract }
