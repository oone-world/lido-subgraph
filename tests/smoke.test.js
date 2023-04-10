import { gql } from 'graphql-request'
import { getBlock } from './config'
import {
  getAragonEvents,
  getDSMEvents,
  getEasyTrackEvents,
  getLidoEvents,
  getLidoOracleEvents,
  getNopRegistryEvents,
  subgraphFetch,
} from './utils'

const SECS_PER_BLOCK = 12
const BLOCKS_RANGE_3HOURS = Math.floor((3 * 60 * 60) / SECS_PER_BLOCK)
const BLOCKS_RANGE_3MONTHS = Math.floor(
  (30 * 24 * 60 * 60 * 3) / SECS_PER_BLOCK
)

const TIMEOUT = 30_000

test(
  'LidoTransfer',
  async () => {
    const startBlock = getBlock() - BLOCKS_RANGE_3HOURS
    const someTransfers = await getLidoEvents('Transfer', startBlock)
    const event = someTransfers.pop()
    expect(event).toBeDefined()

    const id = event.transactionHash + '-' + event.logIndex
    const query = gql`
      query ($id: ID!) {
        lidoTransfer(id: $id) {
          block
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.lidoTransfer?.block).toEqual(String(event.blockNumber))
  },
  TIMEOUT
)

test(
  'OracleMember',
  async () => {
    const events = await getLidoOracleEvents('MemberAdded')
    const event = events.pop()

    const id = event.args.member
    const query = gql`
      query ($id: ID!) {
        oracleMember(id: $id) {
          member
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.oracleMember?.member).toEqual(id.toLowerCase())
  },
  TIMEOUT
)

test(
  'NodeOperator',
  async () => {
    const events = await getNopRegistryEvents('NodeOperatorAdded')
    const event = events.pop()

    const id = event.args.id.toString()

    const query = gql`
      query ($id: ID!) {
        nodeOperator(id: $id) {
          name
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.nodeOperator?.name).toEqual(event.args.name)
  },
  TIMEOUT
)

test(
  'AragonVoting',
  async () => {
    const startBlock = getBlock() - BLOCKS_RANGE_3MONTHS
    const events = await getAragonEvents('StartVote', startBlock)
    const event = events.pop()
    expect(event).toBeDefined()

    const id = event.args.voteId.toString()

    const query = gql`
      query ($id: ID!) {
        voting(id: $id) {
          creator
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.voting?.creator).toEqual(event.args.creator.toLowerCase())
  },
  TIMEOUT
)

test(
  'EasyTrack',
  async () => {
    const startBlock = getBlock() - BLOCKS_RANGE_3MONTHS
    const events = await getEasyTrackEvents('MotionCreated', startBlock)
    const event = events.pop()
    expect(event).toBeDefined()

    const id = event.args._motionId.toString()

    const query = gql`
      query ($id: ID!) {
        motion(id: $id) {
          creator
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.motion?.creator).toEqual(event.args._creator.toLowerCase())
  },
  TIMEOUT
)

test(
  'DepositSecurityModule Guardian',
  async () => {
    const events = await getDSMEvents('GuardianAdded')
    const event = events.pop()

    const id = event.args.guardian.toLowerCase()

    const query = gql`
      query ($id: ID!) {
        guardian(id: $id) {
          block
        }
      }
    `
    const response = await subgraphFetch(query, { id })

    expect(response?.guardian?.block).toEqual(String(event.blockNumber))
  },
  TIMEOUT
)
