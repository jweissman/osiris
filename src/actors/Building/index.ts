import { Building } from './Building';

import { CorridorView } from './CorridorView';
import { CommonAreaView } from './CommonAreaView';
import { DomeView } from './DomeView';
import { TunnelView } from './TunnelView';
import { ArcologyView } from './ArcologyView';
import { LadderView } from './LadderView';
import { SurfaceRoadView } from './SurfaceRoadView';
import { SmallDomeThreeView } from './SmallDomeThreeView';
import { MidDomeView } from './MidDomeView';
import { BigDomeView } from './BigDomeView';
import { SmallRoomThreeView } from './SmallRoomThreeView';
import { MediumRoomView } from './MediumRoomView';
import { LargeRoomView } from './LargeRoomView';
import { HugeRoomView } from './HugeRoomView';
import { MediumRoomThreeView } from './MediumRoomThreeView';
import { MediumSurfaceRoomView } from './MediumSurfaceRoomView';


const structureViews: { [key: string]: typeof Building } = {
    CorridorView,
    LadderView,
    TunnelView,
    SurfaceRoadView,

    DomeView, // small dome 2
    SmallDomeThreeView,
    MidDomeView,
    BigDomeView,

    SmallRoomThreeView,

    CommonAreaView,
    MediumRoomView,
    MediumRoomThreeView,
    LargeRoomView,
    HugeRoomView,

    ArcologyView,
    MediumSurfaceRoomView,
}

export {
    Building,

    CorridorView,
    LadderView,
    TunnelView,
    SurfaceRoadView,

    DomeView, // small dome 2
    SmallDomeThreeView,
    MidDomeView,
    BigDomeView,

    SmallRoomThreeView,

    CommonAreaView,
    MediumRoomView,
    MediumRoomThreeView,

    LargeRoomView,
    HugeRoomView,

    ArcologyView,

    MediumSurfaceRoomView,


    structureViews

}