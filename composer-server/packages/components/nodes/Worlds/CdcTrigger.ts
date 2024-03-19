import { ICommonObject, INode, INodeData, INodeParams, NodeType } from '../../src/Interface'
import * as kafkajs from 'kafkajs'
import { returnNodeExecutionData } from '../../src/utils'
import EventEmitter from 'events'

class CdcTrigger extends EventEmitter implements INode {
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
    kafka: kafkajs.Kafka
    consumer: kafkajs.Consumer

    constructor() {
        super()
        this.label = 'CDC Trigger'
        this.name = 'CdcTrigger'
        this.icon = 'debezium.png'
        this.type = 'trigger'
        this.category = 'Other'
        this.version = 1.0
        this.description = 'Listen to Kafka topic'
        this.incoming = 0
        this.outgoing = 1
        this.inputParameters = [
            {
                label: 'Broker',
                name: 'broker',
                type: 'string',
                default: '',
                description: 'ip:port of Kafka broker',
                optional: false
            },
            {
                label: 'ClientId',
                name: 'clientId',
                type: 'string',
                default: '',
                description: 'unique identifier for the Kafka consumer',
                optional: false
            },
            {
                label: 'GroupId',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'consumer group that the client belongs to',
                optional: false
            },
            {
                label: 'Topic',
                name: 'topic',
                type: 'string',
                default: '',
                description: 'Kafka topic to consume from',
                optional: false
            }
        ]
    }

    async runTrigger(nodeData: INodeData): Promise<void> {
        const inputParametersData = nodeData.inputParameters

        if (inputParametersData === undefined) {
            throw new Error('Required data missing')
        }

        const emitEventKey = nodeData.emitEventKey as string

        this.kafka = new kafkajs.Kafka({
            clientId: inputParametersData.clientId as string,
            brokers: [inputParametersData.broker as string]
        })

        this.consumer = this.kafka.consumer({
            groupId: inputParametersData.groupId as string
        })

        await this.consumer.connect()
        await this.consumer.subscribe({
            topic: inputParametersData.topic as string
        })

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const returnData: ICommonObject[] = []
                returnData.push({
                    topic: topic,
                    partition: partition,
                    message: message.value == null ? null : JSON.parse(message.value.toString())
                })
                this.emit(emitEventKey, returnNodeExecutionData(returnData))
            }
        })
    }

    async removeTrigger(nodeData: INodeData): Promise<void> {
        const emitEventKey = nodeData.emitEventKey as string

        await this.consumer.disconnect()

        this.removeAllListeners(emitEventKey)
    }
}

module.exports = { nodeClass: CdcTrigger }
