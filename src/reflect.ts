import 'reflect-metadata';

interface Decorator {
    (target: any, field: any): void;
    (target: any, field: any, _2: any): void;
}

export const IgnoreNocturne: Decorator = (target: any, field: any, _2?: any) => {
    const meta = Reflect.getMetadata('ignore-nocturne', target) as Set<string> | undefined;
    if (!meta) {
        const temp = new Set<string>([field]);
        Reflect.defineMetadata('ignore-nocturne', temp, target);
    } else {
        meta.add(field);
    }
};
