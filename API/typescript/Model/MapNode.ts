export class MapNode {
    id: number;
    xCoordinate: number;
    yCoordinate: number;
    vehicleDepot: boolean;
    wasteDepot: boolean;

    constructor(id: number, xCoordinate: number, yCoordinate: number, vehicleDepot: boolean, wasteDepot: boolean){
        this.id = id;
        this.xCoordinate = xCoordinate;
        this.yCoordinate = yCoordinate;
        this.vehicleDepot = vehicleDepot;
        this.wasteDepot = wasteDepot;
    }
}
