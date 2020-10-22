
// para fazemos a tipagem, nao fazmos o import pois o TS vai considerar isso
// como um modulo local, entao devemos fazer a declaracao do testRequest inline
declare namespace NodeJS {
    interface Global {
        testRequest: import("supertest").SuperTest<import("supertest").Test>;
    }
}
