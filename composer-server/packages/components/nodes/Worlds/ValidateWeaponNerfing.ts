import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'

class ValidateWeaponNerfing implements INode {
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
        this.label = 'Validate Weapon Nerfing'
        this.name = 'validateWeaponNerfing'
        this.icon = 'game-item-grenade.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Defines if a weapon should be nerfed.'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'Other'
        this.inputParameters = [
            {
                label: 'Weapon (item) ID',
                name: 'weaponID',
                type: 'string',
                description: 'ID of an Weapon (or Item)'
            },
            {
                label: 'Kills Limit for the given weapon',
                name: 'killsCountLimit',
                type: 'string',
                description: 'Kills Limit a weapon'
            },
            {
                label: 'Duration',
                name: 'duration',
                type: 'string',
                description: 'Minutes within weapon gets kills.',
                optional: true
            }
        ] as INodeParams[]
    }
    // TODO: Come up with smarter algo that will define weapon nerfing. A.K.A relative kills limit
    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        // get input params
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const weaponId = inputParametersData.weaponID as string
        const killsCountLimit = inputParametersData.killsCountLimit as string

        // Get total kills of a weapon:
        let url = `${process.env.WGS_API_URL}/studios/apps/bd87c7e4-87ac-4c4e-9687-24fb187e6fa8/items/${weaponId}/kills/total/`
        const axiosConfig: AxiosRequestConfig = {
            method: 'GET' as Method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.X_API_KEY as string,
                'session-token': process.env.SESSION_TOKEN as string
            }
        }
        const response = await axios(axiosConfig)

        if (response.status !== 200) {
            throw new Error('Failed to send request to WGS.')
        }

        const returnData: ICommonObject[] = []
        if (killsCountLimit <= response.data.total_kills) {
            returnData.push({
                toNerf: 1,
                weaponId: weaponId
            })
        } else {
            returnData.push({
                toNerf: 0,
                weaponId: weaponId
            })
        }
        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: ValidateWeaponNerfing }
