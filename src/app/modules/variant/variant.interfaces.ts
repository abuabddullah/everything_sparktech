import { Schema } from "mongoose";

export enum NETWOR_TYPE {
    THREE_G = "3G",
    FOUR_G = "4G",
    FIVE_G = "5G"
}

export enum OS_TYPE {
    IOS = "IOS",
    WINDOWS = "WINDOWS",
    ANDROID = "ANDROID",
    LINUX = "LINUX",
}

export enum RAM_OR_STORAGE_OR_GRAPHICS_CARD {
    TWOGB = "2GB",
    FOURGB = "4GB",
    EIGHTGB = "8GB",
    ONE6GB = "16GB",
    THREE2GB = "32GB",
    SIX4GB = "64GB",
    ONE28GB = "128GB",
    TWO56GB = "256GB",
    FIVE12GB = "512GB",
    ONETB = "1TB",
}

export enum STORAGE_TYPE {
    SSD = "SSD",
    HDD = "HDD",
    NVME = "NVME",
    M_2 = "M.2",
}

export enum PROCESSOR_TYPE {
    AMD = "AMD",
    INTEL = "INTEL",
}

export enum GRAPHICS_CARD_TYPE {
    INTEGRATED = "INTEGRATED",
    DEDICATED = "DEDICATED",
}

export enum RESOLUTION_TYPE {
    HD = "HD",
    Full_HD = "Full HD",
    FOURK_UHD = "4K UHD",
}



export interface IVariant {
    categoryId: Schema.Types.ObjectId;
    subCategoryId: Schema.Types.ObjectId;
    slug: string; // replacing all space by - of category-subCategory and make small letter
    color?: string;
    storage?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    ram?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    network_type?: NETWOR_TYPE[] | string[];
    operating_system?: OS_TYPE | string;
    storage_type?: STORAGE_TYPE | string;
    processor_type?: PROCESSOR_TYPE | string;
    processor?: string; //  i5, i7, Ryzen 5, Ryzen 7
    graphics_card_type?: GRAPHICS_CARD_TYPE | string;
    graphics_card_size?: RAM_OR_STORAGE_OR_GRAPHICS_CARD | string;
    screen_size?: number; // in inch
    resolution?: RESOLUTION_TYPE | string; // HD, Full HD, 4K UHD
    lens_kit?: string; // Body Only, Kit Lens, Dual Lens
    material?: string; //  Leather, Synthetic, Canvas
    size?: string; // EU 38, 39, 40; UK 5, 6, 7,XS, S, M, L, XL
    fabric?: string; // Optional for clothing (e.g., Cotton, Silk)
    weight?: number; // Optional weight for products like dumbbells, sports equipment, etc.
    dimensions?: string;// Single, Queen, King for beds
    capacity?: string; // 1L, 2L
}