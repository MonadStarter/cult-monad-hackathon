import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { formatUnits } from 'viem';

// Core contract ABI for checking if token exists
const coreABI = [
    {
        name: 'isValidToken',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'token', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }]
    },
    {
        name: 'getCreatedTokens',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address[]' }]
    }
] as const;

const tradingABI = [
    {
        name: 'getCreatedTokens',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address[]' }]
    },
    {
        name: 'getTokenInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenAddress', type: 'address' }],
        outputs: [
            { name: 'name', type: 'string' },
            { name: 'symbol', type: 'string' },
            { name: 'marketCapUSD', type: 'uint256' },
            { name: 'marketCapETH', type: 'uint256' },
            { name: 'currentPrice', type: 'uint256' },
            { name: 'ethReserve', type: 'uint256' },
            { name: 'tokenReserve', type: 'uint256' },
            { name: 'totalTrades', type: 'uint256' },
            { name: 'liquidityReleased', type: 'bool' },
            { name: 'tradingRestricted', type: 'bool' },
            { name: 'metadataURI', type: 'string' }
        ]
    },
    {
        name: 'getTokenReserves',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenAddress', type: 'address' }],
        outputs: [
            { name: 'tokenReserve', type: 'uint256' },
            { name: 'ethReserve', type: 'uint256' },
            { name: 'nextTokenPrice', type: 'uint256' },
            { name: 'nextEthRequired', type: 'uint256' },
            { name: 'ethUsdPrice', type: 'uint256' },
            { name: 'isInBondingCurve', type: 'bool' }
        ]
    }
] as const;

export default function TokenDebugInfo({
    tokenAddress,
    tradingAddress,
    coreAddress
}: {
    tokenAddress: `0x${string}`;
    tradingAddress: `0x${string}`;
    coreAddress: `0x${string}`;
}) {
    const [debugData, setDebugData] = useState<any>(null);

    // Check if token exists in Core contract
    const { data: isValidToken } = useContractRead({
        address: coreAddress,
        abi: coreABI,
        functionName: 'isValidToken',
        args: [tokenAddress],
        enabled: !!tokenAddress && !!coreAddress,
    });

    // Get all created tokens from Core
    const { data: coreCreatedTokens } = useContractRead({
        address: coreAddress,
        abi: coreABI,
        functionName: 'getCreatedTokens',
        enabled: !!coreAddress,
    });

    // Get all created tokens from Trading
    const { data: tradingCreatedTokens } = useContractRead({
        address: tradingAddress,
        abi: tradingABI,
        functionName: 'getCreatedTokens',
        enabled: !!tradingAddress,
    });

    // Get Token Info (only if token is valid)
    const { data: tokenInfo, isError: tokenInfoError, error: tokenInfoErrorData } = useContractRead({
        address: tradingAddress,
        abi: tradingABI,
        functionName: 'getTokenInfo',
        args: [tokenAddress],
        enabled: !!tokenAddress && !!tradingAddress && !!isValidToken,
    });

    // Get Token Reserves (only if token is valid)
    const { data: tokenReserves, isError: reservesError, error: reservesErrorData } = useContractRead({
        address: tradingAddress,
        abi: tradingABI,
        functionName: 'getTokenReserves',
        args: [tokenAddress],
        enabled: !!tokenAddress && !!tradingAddress && !!isValidToken,
    });

    useEffect(() => {
        const formatDebugData = () => {
            const isTokenInCore = coreCreatedTokens?.includes(tokenAddress);
            const isTokenInTrading = tradingCreatedTokens?.includes(tokenAddress);

            const debugInfo = {
                contracts: {
                    token: tokenAddress,
                    trading: tradingAddress,
                    core: coreAddress
                },
                tokenValidation: {
                    isValidToken,
                    isInCoreCreatedTokens: isTokenInCore,
                    isInTradingCreatedTokens: isTokenInTrading,
                    coreCreatedTokens,
                    tradingCreatedTokens
                },
                tokenInfo: tokenInfo ? {
                    name: tokenInfo[0],
                    symbol: tokenInfo[1],
                    marketCapUSD: formatUnits(tokenInfo[2], 18),
                    marketCapETH: formatUnits(tokenInfo[3], 18),
                    currentPrice: formatUnits(tokenInfo[4], 18),
                    ethReserve: formatUnits(tokenInfo[5], 18),
                    tokenReserve: formatUnits(tokenInfo[6], 18),
                    totalTrades: Number(tokenInfo[7]),
                    liquidityReleased: tokenInfo[8],
                    tradingRestricted: tokenInfo[9],
                    metadataURI: tokenInfo[10]
                } : null,
                tokenReserves: tokenReserves ? {
                    tokenReserve: formatUnits(tokenReserves[0], 18),
                    ethReserve: formatUnits(tokenReserves[1], 18),
                    nextTokenPrice: formatUnits(tokenReserves[2], 18),
                    nextEthRequired: formatUnits(tokenReserves[3], 18),
                    ethUsdPrice: formatUnits(tokenReserves[4], 18),
                    isInBondingCurve: tokenReserves[5]
                } : null,
                errors: {
                    tokenInfo: tokenInfoError ? tokenInfoErrorData?.message : null,
                    reserves: reservesError ? reservesErrorData?.message : null
                }
            };

            setDebugData(debugInfo);
            console.log('Token Debug Info:', debugInfo);
        };

        formatDebugData();
    }, [
        tokenInfo,
        tokenReserves,
        tokenInfoError,
        reservesError,
        tokenAddress,
        tradingAddress,
        coreAddress,
        isValidToken,
        coreCreatedTokens,
        tradingCreatedTokens
    ]);

    if (!debugData) {
        return <div className="text-sm text-gray-500">Loading debug data...</div>;
    }

    return (
        <div className="bg-gray-50 p-4 rounded-lg text-left mt-4">
            <h3 className="text-lg font-semibold mb-4">Token Debug Information</h3>

            {/* Contract Addresses */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Contract Addresses:</h4>
                <div className="text-sm">
                    <div>Token: {debugData.contracts.token}</div>
                    <div>Trading: {debugData.contracts.trading}</div>
                    <div>Core: {debugData.contracts.core}</div>
                </div>
            </div>

            {/* Token Validation */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Token Validation:</h4>
                <div className="text-sm">
                    <div>Is Valid Token: {debugData.tokenValidation.isValidToken ? 'Yes' : 'No'}</div>
                    <div>In Core Created Tokens: {debugData.tokenValidation.isInCoreCreatedTokens ? 'Yes' : 'No'}</div>
                    <div>In Trading Created Tokens: {debugData.tokenValidation.isInTradingCreatedTokens ? 'Yes' : 'No'}</div>
                    <div className="mt-2">
                        <div>Core Created Tokens Count: {debugData.tokenValidation.coreCreatedTokens?.length || 0}</div>
                        <div>Trading Created Tokens Count: {debugData.tokenValidation.tradingCreatedTokens?.length || 0}</div>
                    </div>
                </div>
            </div>

            {/* Token Info */}
            {debugData.tokenInfo && (
                <div className="mb-4">
                    <h4 className="font-medium mb-2">Token Information:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Name: {debugData.tokenInfo.name}</div>
                        <div>Symbol: {debugData.tokenInfo.symbol}</div>
                        <div>Market Cap (USD): ${Number(debugData.tokenInfo.marketCapUSD).toLocaleString()}</div>
                        <div>Market Cap (ETH): {Number(debugData.tokenInfo.marketCapETH).toFixed(4)} ETH</div>
                        <div>Current Price: {Number(debugData.tokenInfo.currentPrice).toFixed(8)} ETH</div>
                        <div>Total Trades: {debugData.tokenInfo.totalTrades}</div>
                        <div>Liquidity Released: {debugData.tokenInfo.liquidityReleased ? 'Yes' : 'No'}</div>
                        <div>Trading Restricted: {debugData.tokenInfo.tradingRestricted ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            )}

            {/* Token Reserves */}
            {debugData.tokenReserves && (
                <div className="mb-4">
                    <h4 className="font-medium mb-2">Token Reserves:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Token Reserve: {Number(debugData.tokenReserves.tokenReserve).toLocaleString()}</div>
                        <div>ETH Reserve: {Number(debugData.tokenReserves.ethReserve).toFixed(4)} ETH</div>
                        <div>Next Token Price: {Number(debugData.tokenReserves.nextTokenPrice).toFixed(8)} ETH</div>
                        <div>ETH Required: {Number(debugData.tokenReserves.nextEthRequired).toFixed(4)} ETH</div>
                        <div>ETH/USD Price: ${Number(debugData.tokenReserves.ethUsdPrice).toFixed(2)}</div>
                        <div>In Bonding Curve: {debugData.tokenReserves.isInBondingCurve ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            )}

            {/* Errors */}
            {(debugData.errors.tokenInfo || debugData.errors.reserves) && (
                <div className="mt-4 text-red-500 text-sm">
                    {debugData.errors.tokenInfo && (
                        <div className="mb-2">
                            <strong>Token Info Error:</strong><br />
                            {debugData.errors.tokenInfo}
                        </div>
                    )}
                    {debugData.errors.reserves && (
                        <div>
                            <strong>Reserves Error:</strong><br />
                            {debugData.errors.reserves}
                        </div>
                    )}
                </div>
            )}

            {/* Raw Data View */}
            <div className="mt-4">
                <button
                    onClick={() => console.log('Full Debug Data:', debugData)}
                    className="text-blue-500 text-sm hover:text-blue-600"
                >
                    Log Full Debug Data to Console
                </button>
            </div>
        </div>
    );
}