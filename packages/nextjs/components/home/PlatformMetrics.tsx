'use client'
import React from 'react';
import { useContractRead } from 'wagmi';
import { PLOT_FUN_CORE_ABI } from '../../constants/abis';

function PlatformMetrics() {
    const { data: tokens = [] } = useContractRead({
        address: process.env.NEXT_PUBLIC_PLOT_FUN_CORE_ADDRESS,
        abi: PLOT_FUN_CORE_ABI,
        functionName: 'getCreatedTokens',
    });

    const tokenCount = tokens.length;
    const formattedCount = tokenCount >= 1000 ? `${(tokenCount / 1000).toFixed(1)}k+` : tokenCount;

    return (
        <section className="p-8 sm:p-24 page">
            <div className="platform-metrics-card">
                <div>
                    <h1>$34.3M</h1>
                    <p className="text-sm">Market Cap</p>
                </div>
                <div>
                    <h1>$51M</h1>
                    <p className="text-sm">Volume</p>
                </div>
                <div>
                    <h1>{formattedCount}</h1>
                    <p className="text-sm">meme coins deployed</p>
                </div>
            </div>
        </section>
    );
}

export default PlatformMetrics;