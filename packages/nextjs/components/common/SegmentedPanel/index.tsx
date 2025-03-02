"use client";

import { ReactNode, useState } from "react";
import Segmented, { SegmentedOptionType } from "./Segemented";

export type SegmentedPanelOptionType = SegmentedOptionType & {
    content: ReactNode
}

function SegmentedPanel({ panels, defaultValue, className, segmentedClassName }: { panels: SegmentedPanelOptionType[], defaultValue?: string, segmentedClassName?: string, className?: string }) {
    const [selectedPanel, setSelectedPanel] = useState<string>(defaultValue || panels[0].id);


    return (<div className={`content-wrapper-card p-5 flex flex-col gap-5 ${className}`}>
        <Segmented 
            options={panels as SegmentedOptionType[]} 
            value={selectedPanel} 
            onChange={(value: string) => setSelectedPanel(value)} 
            className={segmentedClassName} 
        />
        {panels.find((value) => selectedPanel === value.id)?.content}
    </div>);
}

export default SegmentedPanel;