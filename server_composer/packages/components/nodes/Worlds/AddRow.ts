import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src'
import { returnNodeExecutionData } from '../../src/utils'
import axios, { AxiosRequestConfig, Method } from 'axios'
import * as DbSchema from './DatabaseTables'

class AddRow implements INode {
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
        this.label = 'Add Row'
        this.name = 'AddRow'
        this.icon = 'db.png'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Add a row to a database table'
        this.incoming = 1
        this.outgoing = 1
        this.category = 'Other'
        this.inputParameters = [
            {
                label: 'Choose Table',
                name: 'table',
                type: 'options',
                options: [...DbSchema.tables],
                default: '',
                description: 'Consider events from this table'
            },
            {
                label: 'Body',
                name: 'body',
                type: 'json',
                description: 'The body that will contain the contents for the new row'
            }
        ] as INodeParams[]
    }

    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const inputParametersData = nodeData.inputParameters
        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }
        const table = inputParametersData.table as string
        const body = inputParametersData.body

        const returnData: ICommonObject[] = []
        let responseData: any
        let url = `https://wgs-node-production.up.railway.app/api/${table}`
        let apiKey = process.env.X_API_KEY

        const axiosConfig: AxiosRequestConfig = {
            method: 'POST' as Method,
            url,
            headers: {
                'Content-Type': 'application/json',
                // @ts-ignore
                'x-api-key': apiKey
            },
            data: body
        }
        const response = await axios(axiosConfig)
        responseData = {
            status: response.status
        }

        if (Array.isArray(responseData)) returnData.push(...responseData)
        else returnData.push(responseData)

        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: AddRow }
