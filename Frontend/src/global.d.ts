// global.d.ts
export {};

declare global {
    interface Window {
        permissions: string[]; // Define the type of your custom property
    }
}

