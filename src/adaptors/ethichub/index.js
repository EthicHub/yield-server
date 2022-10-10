const utils = require('../utils');
const { gql, request } = require('graphql-request');


const UNISWAP_LP_ETHIXWETH = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const BALANCER_LP_ETHIXDAI = '0x69183d2ce96B6b8962f3013e0Af4545F26F00293';
const UBESWAP_LP_ETHIXCUSD = '0x62cfA295864cfF683CDE9B47D4bACC77B885DdB7';
const SYMMETRIC_LP_ETHIXCELO = '0xaD2F9f4CD2Ae4f2dD2841EB1ea7e162fb4767D4D';

const poolsFunction = async () => {
  const apyData = await utils.getData(
    'https://api.anchorprotocol.com/api/v1/market/ust'
  );
  const dataTvl = await utils.getData(
    'https://api.anchorprotocol.com/api/v1/deposit'
  );

  // CoinGecko API
  let coinprices = await utils.getData(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethichub%2Cethereum%2Cdai%2Ccelo%2Ccelo-dollar&vs_currencies=usd'
  );

  const uniswapUrl = `https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2`;

  const tvlUSDQuery = gql`
  {
    pair(id: "0xb14b9464b52f502b0edf51ba3a529bc63706b458"){
        reserveUSD
    }
  }
  `;

  const uniswapPoolData = await request(uniswapUrl, tvlUSDQuery);

  const uniswapPool = {
    pool: `${UNISWAP_LP_ETHIXWETH}-ethereum`.toLowerCase(),
    chain: utils.formatChain('ethereum'),
    project: 'ethichub',
    symbol: utils.formatSymbol('ETHIX/WETH'),
    tvlUsd: Number(uniswapPoolData.pair.reserveUSD), 
    apyBase: apyData.deposit_apy * 100,
  };

  const balancerPool = {
    pool: `${BALANCER_LP_ETHIXDAI}-ethereum`.toLowerCase(),
    chain: utils.formatChain('ethereum'),
    project: 'ethichub',
    symbol: utils.formatSymbol('ETHIX/DAI'),
    tvlUsd: Number(dataTvl.total_ust_deposits) / 1e6,
    apy: apyData.deposit_apy * 100,
  };

  const ubeswapPool = {
    pool: `${UBESWAP_LP_ETHIXCUSD}-celo`.toLowerCase(),
    chain: utils.formatChain('celo'),
    project: 'ethichub',
    symbol: utils.formatSymbol('ETHIX/CUSD'),
    tvlUsd: Number(dataTvl.total_ust_deposits) / 1e6,
    apy: apyData.deposit_apy * 100,
  };

  const symmetricPool = {
    pool: `${SYMMETRIC_LP_ETHIXCELO}-celo`.toLowerCase(),
    chain: utils.formatChain('celo'),
    project: 'ethichub',
    symbol: utils.formatSymbol('ETHIX/CELO'),
    tvlUsd: Number(dataTvl.total_ust_deposits) / 1e6,
    apy: apyData.deposit_apy * 100,
  };

  return [uniswapPool, balancerPool, ubeswapPool, symmetricPool]; // Anchor only has a single pool with APY
};

module.exports = {
  timetravel: false,
  apy: poolsFunction,
  url: 'https://ethix.ethichub.com',
};