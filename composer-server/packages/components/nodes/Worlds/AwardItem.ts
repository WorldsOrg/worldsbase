import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'

class AwardItem implements INode {
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
        this.label = 'Award a Resource'
        this.name = 'awardItem'
        this.icon = 'game-item-grenade.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Creates player invetory row in supabase.'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'Other'
        this.inputParameters = [
            {
                label: 'Player ID',
                name: 'playerId',
                type: 'number',
                description: 'ID of a user to give an item'
            },
            {
                label: 'Resource ID',
                name: 'resourceId',
                type: 'number',
                description: 'Resource ID to award.'
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const resourceId = inputParametersData.resourceId as string
        const playerId = inputParametersData.playerId as string
        const returnData: ICommonObject[] = []
        let responseData: any
        let url = `${process.env.WGS_API_URL}/table/insertdata`
        const requestBody = {
            tableName: 'player_inventory',
            data: {
                player_id: playerId,
                resource_id: resourceId,
                quantity: 1
            }
        }
        const axiosConfig: AxiosRequestConfig = {
            method: 'POST' as Method,
            url,
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.X_API_KEY as string },
            data: requestBody
        }
        const response = await axios(axiosConfig)
        responseData = response.data
        if (Array.isArray(responseData)) returnData.push(...responseData)
        else returnData.push(responseData)
        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: AwardItem }
