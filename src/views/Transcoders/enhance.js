import React from 'react'
import { compose, withHandlers } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import {
  connectCurrentRoundQuery,
  connectProtocolQuery,
  connectTranscodersQuery,
  connectToasts,
} from '../../enhancers'
import { MathBN } from '../../utils'
import { mockAccount } from '@livepeer/graphql-sdk'

const MeDelegatorTranscoderQuery = gql`
  fragment DelegatorFragment on Delegator {
    id
    status
    delegateAddress
    bondedAmount
    fees
    delegatedAmount
    lastClaimRound
    pendingStake
    startRound
    withdrawRound
  }

  fragment TranscoderFragment on Transcoder {
    id
    delegator {
      id
    }
    rewardCut
    feeShare
    activationRound
    deactivationRound
    pools(orderBy: id, orderDirection: desc) {
      rewardTokens
      round {
        id
      }
    }
  }

  fragment AccountFragment on Account {
    id
    ethBalance
    tokenBalance
    delegator {
      ...DelegatorFragment
    }
    transcoder {
      ...TranscoderFragment
    }
  }

  query MeDelegatorTranscoderQuery {
    me {
      ...AccountFragment
    }
  }
`

const connectMeDelegatorTranscoderQuery = graphql(MeDelegatorTranscoderQuery, {
  props: ({ data, ownProps }) => {
    const { me, ...queryData } = data
    return {
      ...ownProps,
      me: {
        ...queryData,
        data: mockAccount(me),
      },
    }
  },
  options: ({ match }) => ({
    pollInterval: 5 * 1000,
    variables: {},
  }),
})

const mapMutationHandlers = withHandlers({
  bond: ({ currentRound, history, me, protocol, toasts }) => ({ id }) => {
    const { id: lastInitializedRound } = currentRound.data
    const { status, lastClaimRound } = me.data.delegator
    const { maxEarningsClaimsRounds } = protocol.data
    const isUnbonded = status === 'Unbonded'
    const unclaimedRounds = isUnbonded
      ? ' 0'
      : MathBN.sub(lastInitializedRound, lastClaimRound)
    if (!currentRound.data.initialized) {
      return toasts.push({
        id: 'bond',
        type: 'warn',
        title: 'Unable to bond',
        body: 'The current round is not initialized.',
      })
    }
    if (MathBN.gt(unclaimedRounds, maxEarningsClaimsRounds)) {
      return toasts.push({
        id: 'bond',
        type: 'warn',
        title: 'Unable to bond',
        body: (
          <span>
            You have unclaimed earnings from more than {maxEarningsClaimsRounds}{' '}
            previous rounds. <br />
            <a href="/me/delegating">Claim Your Earnings</a>
          </span>
        ),
      })
    }
    history.push(`#/bond/${id}`)
  },
  unbond: ({ currentRound, history, me, toasts, protocol }) => async ({
    id,
  }) => {
    try {
      const { id: lastInitializedRound } = currentRound.data
      const { status, lastClaimRound } = me.data.delegator
      const { maxEarningsClaimsRounds } = protocol.data
      const isUnbonded = status === 'Unbonded'
      const unclaimedRounds = isUnbonded
        ? ' 0'
        : MathBN.sub(lastInitializedRound, lastClaimRound)
      if (!currentRound.data.initialized) {
        return toasts.push({
          id: 'unbond',
          type: 'warn',
          title: 'Unable to unbond',
          body: 'The current round is not initialized.',
        })
      }
      if (MathBN.gt(unclaimedRounds, maxEarningsClaimsRounds)) {
        return toasts.push({
          id: 'unbond',
          type: 'warn',
          title: 'Unable to unbond',
          body: (
            <span>
              You have unclaimed earnings from more than{' '}
              {maxEarningsClaimsRounds} previous rounds. <br />
              <a href="/me/delegating">Claim Your Earnings</a>
            </span>
          ),
        })
      }
      history.push(`#/unbond/${id}`)
    } catch (err) {
      if (!/User denied/.test(err.message)) {
        toasts.push({
          id: 'unbond',
          type: 'error',
          title: 'Unbond Failed',
          body: err.message,
        })
      }
    }
    history.push(`#/unbond/${id}`)
  },
})

export default compose(
  connectCurrentRoundQuery,
  connectMeDelegatorTranscoderQuery,
  connectProtocolQuery,
  connectTranscodersQuery,
  connectToasts,
  mapMutationHandlers,
)
