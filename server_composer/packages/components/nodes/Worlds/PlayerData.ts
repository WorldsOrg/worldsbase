import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'
import * as DbSchema from './DatabaseTables'

class PlayerData implements INode {
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
        this.label = 'Get Player Data'
        this.name = 'PlayerData'
        this.icon = 'user.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Get player data from database'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'Other'
        this.inputParameters = [
            {
                label: 'Player Id',
                name: 'playerId',
                type: 'number',
                description: 'The player Id'
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const playerId = inputParametersData.playerId as string

        const returnData: ICommonObject[] = []
        let responseData: any
        let url = `https://wgs-node-production.up.railway.app/api/players/${playerId}`
        let apiKey = process.env.X_API_KEY

        const axiosConfig: AxiosRequestConfig = {
            method: 'GET' as Method,
            url,
            headers: {
                'Content-Type': 'application/json',
                // @ts-ignore
                'x-api-key': apiKey
            }
        }
        const response = await axios(axiosConfig)
        responseData = response.data

        if (Array.isArray(responseData)) returnData.push(...responseData)
        else returnData.push(responseData)

        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: PlayerData }
