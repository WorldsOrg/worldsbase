import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'

class NerfWeapon implements INode {
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
        this.label = 'Nerf Weapon'
        this.name = 'nerfWeapon'
        this.icon = 'game-item-grenade.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Reduces weapons demage.'
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
                label: 'Damage to reduce',
                name: 'damageToReduce',
                type: 'number',
                description: 'Damage to reduce'
            },
            {
                label: 'To Nerf',
                name: 'toNerf',
                type: 'number',
                description: 'Should be nerfed or not',
                default: 1
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        let status = 'Success'
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }

        const toNerf = inputParametersData.toNerf as boolean
        if (!toNerf) {
            throw new Error('The weapon cannot be nerfed.')
        }

        const weaponId = inputParametersData.weaponID as string
        const damageToReduce = inputParametersData.damageToReduce as number

        // Get weapon:
        let url = `${process.env.WGS_API_URL}/studios/apps/bd87c7e4-87ac-4c4e-9687-24fb187e6fa8/items/${weaponId}/`
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
            status = 'Error'
        }

        // Calculate new weapon damage:
        let item = response.data
        const currentWeaponData = response.data.item_data

        // Reduce weapon damage
        const objectWithDamage = currentWeaponData.find((obj: any) => 'damage' in obj)
        if (!objectWithDamage) {
            throw new Error('Provide a weapon with damage attribute.')
        }
        objectWithDamage.damage -= damageToReduce

        // Update weapon damage
        let updateUrl = `${process.env.WGS_API_URL}/studios/apps/bd87c7e4-87ac-4c4e-9687-24fb187e6fa8/items/${weaponId}/`
        const axiosConfigUpdate: AxiosRequestConfig = {
            method: 'PUT' as Method,
            url: updateUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.X_API_KEY as string,
                'session-token': process.env.SESSION_TOKEN as string
            },
            data: {
                item_data: item.item_data
            }
        }
        const updateResponse = await axios(axiosConfigUpdate)

        if (updateResponse.status !== 204) {
            status = 'Error'
        }

        const updatedItemResponse = await axios(axiosConfig)
        const returnData: ICommonObject[] = []
        returnData.push({
            status: status,
            updatedWeapon: updatedItemResponse.data
        })
        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: NerfWeapon }
