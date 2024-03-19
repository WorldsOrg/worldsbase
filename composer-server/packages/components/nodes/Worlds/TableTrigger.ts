import { ICommonObject, INode, INodeData, INodeParams, NodeType } from '../../src/Interface'
import * as kafkajs from 'kafkajs'
import { returnNodeExecutionData } from '../../src/utils'
import EventEmitter from 'events'
import * as DbSchema from './DatabaseTables'

type StringToStringDictionary = {
    [key: string]: string
}

class TableTrigger extends EventEmitter implements INode {
    label: string
    name: string
    type: NodeType
    description?: string
    version: number
    icon: string
    category: string
    incoming: number
    outgoing: number
    inputParameters?: INodeParams[]
    topicMap: StringToStringDictionary
    kafka: kafkajs.Kafka
    consumer: kafkajs.Consumer

    constructor() {
        super()
        this.label = 'Table Trigger'
        this.name = 'TableTrigger'
        this.icon = 'debezium.png'
        this.type = 'trigger'
        this.category = 'Utilities'
        this.version = 1.0
        this.description = 'Data is sent to next node when a row is created or updated in a database table'
        this.incoming = 0
        this.outgoing = 1
        this.inputParameters = [
            {
                label: 'Choose Table',
                name: 'table',
                type: 'options',
                options: [...DbSchema.tables],
                default: '',
                description: 'Consider events from this table'
            }
        ]
        this.topicMap = {
            game_data: 'wgsdb.public.game_data',
            game_history: 'wgsdb.public.game_history',
            game_variables: 'wgsdb.public.game_variables',
            match_history: 'wgsdb.public.match_history',
            player_inventory: 'wgsdb.public.player_inventory',
            player_match_performance: 'wgsdb.public.player_match_performance',
            players: 'wgsdb.public.players',
            resources: 'wgsdb.public.resources'
        }
    }

    async runTrigger(nodeData: INodeData): Promise<void> {
        const inputParametersData = nodeData.inputParameters

        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }

        const emitEventKey = nodeData.emitEventKey as string

        this.kafka = new kafkajs.Kafka({
            brokers: ['34.170.229.180:30792']
        })

        this.consumer = this.kafka.consumer({
            groupId: 'composer-consumers-dev'
        })

        await this.consumer.connect()

        // get topic by indexing into topic map with table selection from input parameters
        await this.consumer.subscribe({
            topic: this.topicMap[inputParametersData.table as string] as string
        })

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (message.value != null) {
                    const data = JSON.parse(message.value.toString())
                    const returnData: ICommonObject[] = []
                    returnData.push(data.payload.after)
                    this.emit(emitEventKey, returnNodeExecutionData(returnData))
                }
            }
        })
    }

    async removeTrigger(nodeData: INodeData): Promise<void> {
        const emitEventKey = nodeData.emitEventKey as string

        await this.consumer.disconnect()

        this.removeAllListeners(emitEventKey)
    }
}

module.exports = { nodeClass: TableTrigger }
