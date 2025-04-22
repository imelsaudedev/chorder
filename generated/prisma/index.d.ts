
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Song
 * 
 */
export type Song = $Result.DefaultSelection<Prisma.$SongPayload>
/**
 * Model SongArrangement
 * 
 */
export type SongArrangement = $Result.DefaultSelection<Prisma.$SongArrangementPayload>
/**
 * Model SongUnit
 * 
 */
export type SongUnit = $Result.DefaultSelection<Prisma.$SongUnitPayload>
/**
 * Model Service
 * 
 */
export type Service = $Result.DefaultSelection<Prisma.$ServicePayload>
/**
 * Model ServiceUnit
 * 
 */
export type ServiceUnit = $Result.DefaultSelection<Prisma.$ServiceUnitPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const SongUnitType: {
  BLOCK: 'BLOCK',
  INTRO: 'INTRO',
  VERSE: 'VERSE',
  PRECHORUS: 'PRECHORUS',
  CHORUS: 'CHORUS',
  BRIDGE: 'BRIDGE',
  INTERLUDE: 'INTERLUDE',
  SOLO: 'SOLO',
  ENDING: 'ENDING'
};

export type SongUnitType = (typeof SongUnitType)[keyof typeof SongUnitType]


export const ServiceUnitType: {
  SONG: 'SONG'
};

export type ServiceUnitType = (typeof ServiceUnitType)[keyof typeof ServiceUnitType]

}

export type SongUnitType = $Enums.SongUnitType

export const SongUnitType: typeof $Enums.SongUnitType

export type ServiceUnitType = $Enums.ServiceUnitType

export const ServiceUnitType: typeof $Enums.ServiceUnitType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Songs
 * const songs = await prisma.song.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Songs
   * const songs = await prisma.song.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.song`: Exposes CRUD operations for the **Song** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Songs
    * const songs = await prisma.song.findMany()
    * ```
    */
  get song(): Prisma.SongDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.songArrangement`: Exposes CRUD operations for the **SongArrangement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SongArrangements
    * const songArrangements = await prisma.songArrangement.findMany()
    * ```
    */
  get songArrangement(): Prisma.SongArrangementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.songUnit`: Exposes CRUD operations for the **SongUnit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SongUnits
    * const songUnits = await prisma.songUnit.findMany()
    * ```
    */
  get songUnit(): Prisma.SongUnitDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.service`: Exposes CRUD operations for the **Service** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Services
    * const services = await prisma.service.findMany()
    * ```
    */
  get service(): Prisma.ServiceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.serviceUnit`: Exposes CRUD operations for the **ServiceUnit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ServiceUnits
    * const serviceUnits = await prisma.serviceUnit.findMany()
    * ```
    */
  get serviceUnit(): Prisma.ServiceUnitDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Song: 'Song',
    SongArrangement: 'SongArrangement',
    SongUnit: 'SongUnit',
    Service: 'Service',
    ServiceUnit: 'ServiceUnit'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "song" | "songArrangement" | "songUnit" | "service" | "serviceUnit"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Song: {
        payload: Prisma.$SongPayload<ExtArgs>
        fields: Prisma.SongFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SongFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SongFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          findFirst: {
            args: Prisma.SongFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SongFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          findMany: {
            args: Prisma.SongFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>[]
          }
          create: {
            args: Prisma.SongCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          createMany: {
            args: Prisma.SongCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SongCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>[]
          }
          delete: {
            args: Prisma.SongDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          update: {
            args: Prisma.SongUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          deleteMany: {
            args: Prisma.SongDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SongUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SongUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>[]
          }
          upsert: {
            args: Prisma.SongUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongPayload>
          }
          aggregate: {
            args: Prisma.SongAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSong>
          }
          groupBy: {
            args: Prisma.SongGroupByArgs<ExtArgs>
            result: $Utils.Optional<SongGroupByOutputType>[]
          }
          count: {
            args: Prisma.SongCountArgs<ExtArgs>
            result: $Utils.Optional<SongCountAggregateOutputType> | number
          }
        }
      }
      SongArrangement: {
        payload: Prisma.$SongArrangementPayload<ExtArgs>
        fields: Prisma.SongArrangementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SongArrangementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SongArrangementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          findFirst: {
            args: Prisma.SongArrangementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SongArrangementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          findMany: {
            args: Prisma.SongArrangementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>[]
          }
          create: {
            args: Prisma.SongArrangementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          createMany: {
            args: Prisma.SongArrangementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SongArrangementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>[]
          }
          delete: {
            args: Prisma.SongArrangementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          update: {
            args: Prisma.SongArrangementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          deleteMany: {
            args: Prisma.SongArrangementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SongArrangementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SongArrangementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>[]
          }
          upsert: {
            args: Prisma.SongArrangementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongArrangementPayload>
          }
          aggregate: {
            args: Prisma.SongArrangementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSongArrangement>
          }
          groupBy: {
            args: Prisma.SongArrangementGroupByArgs<ExtArgs>
            result: $Utils.Optional<SongArrangementGroupByOutputType>[]
          }
          count: {
            args: Prisma.SongArrangementCountArgs<ExtArgs>
            result: $Utils.Optional<SongArrangementCountAggregateOutputType> | number
          }
        }
      }
      SongUnit: {
        payload: Prisma.$SongUnitPayload<ExtArgs>
        fields: Prisma.SongUnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SongUnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SongUnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          findFirst: {
            args: Prisma.SongUnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SongUnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          findMany: {
            args: Prisma.SongUnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>[]
          }
          create: {
            args: Prisma.SongUnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          createMany: {
            args: Prisma.SongUnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SongUnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>[]
          }
          delete: {
            args: Prisma.SongUnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          update: {
            args: Prisma.SongUnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          deleteMany: {
            args: Prisma.SongUnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SongUnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SongUnitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>[]
          }
          upsert: {
            args: Prisma.SongUnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SongUnitPayload>
          }
          aggregate: {
            args: Prisma.SongUnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSongUnit>
          }
          groupBy: {
            args: Prisma.SongUnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<SongUnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.SongUnitCountArgs<ExtArgs>
            result: $Utils.Optional<SongUnitCountAggregateOutputType> | number
          }
        }
      }
      Service: {
        payload: Prisma.$ServicePayload<ExtArgs>
        fields: Prisma.ServiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findFirst: {
            args: Prisma.ServiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          findMany: {
            args: Prisma.ServiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          create: {
            args: Prisma.ServiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          createMany: {
            args: Prisma.ServiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          delete: {
            args: Prisma.ServiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          update: {
            args: Prisma.ServiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          deleteMany: {
            args: Prisma.ServiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServiceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>[]
          }
          upsert: {
            args: Prisma.ServiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicePayload>
          }
          aggregate: {
            args: Prisma.ServiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateService>
          }
          groupBy: {
            args: Prisma.ServiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceCountAggregateOutputType> | number
          }
        }
      }
      ServiceUnit: {
        payload: Prisma.$ServiceUnitPayload<ExtArgs>
        fields: Prisma.ServiceUnitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceUnitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceUnitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          findFirst: {
            args: Prisma.ServiceUnitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceUnitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          findMany: {
            args: Prisma.ServiceUnitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>[]
          }
          create: {
            args: Prisma.ServiceUnitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          createMany: {
            args: Prisma.ServiceUnitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceUnitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>[]
          }
          delete: {
            args: Prisma.ServiceUnitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          update: {
            args: Prisma.ServiceUnitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          deleteMany: {
            args: Prisma.ServiceUnitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceUnitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ServiceUnitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>[]
          }
          upsert: {
            args: Prisma.ServiceUnitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceUnitPayload>
          }
          aggregate: {
            args: Prisma.ServiceUnitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServiceUnit>
          }
          groupBy: {
            args: Prisma.ServiceUnitGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceUnitGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceUnitCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceUnitCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    song?: SongOmit
    songArrangement?: SongArrangementOmit
    songUnit?: SongUnitOmit
    service?: ServiceOmit
    serviceUnit?: ServiceUnitOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SongCountOutputType
   */

  export type SongCountOutputType = {
    arrangements: number
  }

  export type SongCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    arrangements?: boolean | SongCountOutputTypeCountArrangementsArgs
  }

  // Custom InputTypes
  /**
   * SongCountOutputType without action
   */
  export type SongCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongCountOutputType
     */
    select?: SongCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SongCountOutputType without action
   */
  export type SongCountOutputTypeCountArrangementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SongArrangementWhereInput
  }


  /**
   * Count Type SongArrangementCountOutputType
   */

  export type SongArrangementCountOutputType = {
    units: number
  }

  export type SongArrangementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    units?: boolean | SongArrangementCountOutputTypeCountUnitsArgs
  }

  // Custom InputTypes
  /**
   * SongArrangementCountOutputType without action
   */
  export type SongArrangementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangementCountOutputType
     */
    select?: SongArrangementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SongArrangementCountOutputType without action
   */
  export type SongArrangementCountOutputTypeCountUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SongUnitWhereInput
  }


  /**
   * Count Type ServiceCountOutputType
   */

  export type ServiceCountOutputType = {
    units: number
  }

  export type ServiceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    units?: boolean | ServiceCountOutputTypeCountUnitsArgs
  }

  // Custom InputTypes
  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceCountOutputType
     */
    select?: ServiceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ServiceCountOutputType without action
   */
  export type ServiceCountOutputTypeCountUnitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceUnitWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Song
   */

  export type AggregateSong = {
    _count: SongCountAggregateOutputType | null
    _avg: SongAvgAggregateOutputType | null
    _sum: SongSumAggregateOutputType | null
    _min: SongMinAggregateOutputType | null
    _max: SongMaxAggregateOutputType | null
  }

  export type SongAvgAggregateOutputType = {
    id: number | null
    legacyId: number | null
  }

  export type SongSumAggregateOutputType = {
    id: number | null
    legacyId: number | null
  }

  export type SongMinAggregateOutputType = {
    id: number | null
    legacyId: number | null
    title: string | null
    slug: string | null
    lyrics: string | null
    artist: string | null
    isDeleted: boolean | null
  }

  export type SongMaxAggregateOutputType = {
    id: number | null
    legacyId: number | null
    title: string | null
    slug: string | null
    lyrics: string | null
    artist: string | null
    isDeleted: boolean | null
  }

  export type SongCountAggregateOutputType = {
    id: number
    legacyId: number
    title: number
    slug: number
    lyrics: number
    artist: number
    isDeleted: number
    _all: number
  }


  export type SongAvgAggregateInputType = {
    id?: true
    legacyId?: true
  }

  export type SongSumAggregateInputType = {
    id?: true
    legacyId?: true
  }

  export type SongMinAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    lyrics?: true
    artist?: true
    isDeleted?: true
  }

  export type SongMaxAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    lyrics?: true
    artist?: true
    isDeleted?: true
  }

  export type SongCountAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    lyrics?: true
    artist?: true
    isDeleted?: true
    _all?: true
  }

  export type SongAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Song to aggregate.
     */
    where?: SongWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Songs to fetch.
     */
    orderBy?: SongOrderByWithRelationInput | SongOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SongWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Songs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Songs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Songs
    **/
    _count?: true | SongCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SongAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SongSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SongMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SongMaxAggregateInputType
  }

  export type GetSongAggregateType<T extends SongAggregateArgs> = {
        [P in keyof T & keyof AggregateSong]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSong[P]>
      : GetScalarType<T[P], AggregateSong[P]>
  }




  export type SongGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SongWhereInput
    orderBy?: SongOrderByWithAggregationInput | SongOrderByWithAggregationInput[]
    by: SongScalarFieldEnum[] | SongScalarFieldEnum
    having?: SongScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SongCountAggregateInputType | true
    _avg?: SongAvgAggregateInputType
    _sum?: SongSumAggregateInputType
    _min?: SongMinAggregateInputType
    _max?: SongMaxAggregateInputType
  }

  export type SongGroupByOutputType = {
    id: number
    legacyId: number | null
    title: string
    slug: string
    lyrics: string
    artist: string | null
    isDeleted: boolean
    _count: SongCountAggregateOutputType | null
    _avg: SongAvgAggregateOutputType | null
    _sum: SongSumAggregateOutputType | null
    _min: SongMinAggregateOutputType | null
    _max: SongMaxAggregateOutputType | null
  }

  type GetSongGroupByPayload<T extends SongGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SongGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SongGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SongGroupByOutputType[P]>
            : GetScalarType<T[P], SongGroupByOutputType[P]>
        }
      >
    >


  export type SongSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    lyrics?: boolean
    artist?: boolean
    isDeleted?: boolean
    arrangements?: boolean | Song$arrangementsArgs<ExtArgs>
    _count?: boolean | SongCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["song"]>

  export type SongSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    lyrics?: boolean
    artist?: boolean
    isDeleted?: boolean
  }, ExtArgs["result"]["song"]>

  export type SongSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    lyrics?: boolean
    artist?: boolean
    isDeleted?: boolean
  }, ExtArgs["result"]["song"]>

  export type SongSelectScalar = {
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    lyrics?: boolean
    artist?: boolean
    isDeleted?: boolean
  }

  export type SongOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "legacyId" | "title" | "slug" | "lyrics" | "artist" | "isDeleted", ExtArgs["result"]["song"]>
  export type SongInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    arrangements?: boolean | Song$arrangementsArgs<ExtArgs>
    _count?: boolean | SongCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SongIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SongIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SongPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Song"
    objects: {
      arrangements: Prisma.$SongArrangementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      legacyId: number | null
      title: string
      slug: string
      lyrics: string
      artist: string | null
      isDeleted: boolean
    }, ExtArgs["result"]["song"]>
    composites: {}
  }

  type SongGetPayload<S extends boolean | null | undefined | SongDefaultArgs> = $Result.GetResult<Prisma.$SongPayload, S>

  type SongCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SongFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SongCountAggregateInputType | true
    }

  export interface SongDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Song'], meta: { name: 'Song' } }
    /**
     * Find zero or one Song that matches the filter.
     * @param {SongFindUniqueArgs} args - Arguments to find a Song
     * @example
     * // Get one Song
     * const song = await prisma.song.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SongFindUniqueArgs>(args: SelectSubset<T, SongFindUniqueArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Song that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SongFindUniqueOrThrowArgs} args - Arguments to find a Song
     * @example
     * // Get one Song
     * const song = await prisma.song.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SongFindUniqueOrThrowArgs>(args: SelectSubset<T, SongFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Song that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongFindFirstArgs} args - Arguments to find a Song
     * @example
     * // Get one Song
     * const song = await prisma.song.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SongFindFirstArgs>(args?: SelectSubset<T, SongFindFirstArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Song that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongFindFirstOrThrowArgs} args - Arguments to find a Song
     * @example
     * // Get one Song
     * const song = await prisma.song.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SongFindFirstOrThrowArgs>(args?: SelectSubset<T, SongFindFirstOrThrowArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Songs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Songs
     * const songs = await prisma.song.findMany()
     * 
     * // Get first 10 Songs
     * const songs = await prisma.song.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const songWithIdOnly = await prisma.song.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SongFindManyArgs>(args?: SelectSubset<T, SongFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Song.
     * @param {SongCreateArgs} args - Arguments to create a Song.
     * @example
     * // Create one Song
     * const Song = await prisma.song.create({
     *   data: {
     *     // ... data to create a Song
     *   }
     * })
     * 
     */
    create<T extends SongCreateArgs>(args: SelectSubset<T, SongCreateArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Songs.
     * @param {SongCreateManyArgs} args - Arguments to create many Songs.
     * @example
     * // Create many Songs
     * const song = await prisma.song.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SongCreateManyArgs>(args?: SelectSubset<T, SongCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Songs and returns the data saved in the database.
     * @param {SongCreateManyAndReturnArgs} args - Arguments to create many Songs.
     * @example
     * // Create many Songs
     * const song = await prisma.song.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Songs and only return the `id`
     * const songWithIdOnly = await prisma.song.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SongCreateManyAndReturnArgs>(args?: SelectSubset<T, SongCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Song.
     * @param {SongDeleteArgs} args - Arguments to delete one Song.
     * @example
     * // Delete one Song
     * const Song = await prisma.song.delete({
     *   where: {
     *     // ... filter to delete one Song
     *   }
     * })
     * 
     */
    delete<T extends SongDeleteArgs>(args: SelectSubset<T, SongDeleteArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Song.
     * @param {SongUpdateArgs} args - Arguments to update one Song.
     * @example
     * // Update one Song
     * const song = await prisma.song.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SongUpdateArgs>(args: SelectSubset<T, SongUpdateArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Songs.
     * @param {SongDeleteManyArgs} args - Arguments to filter Songs to delete.
     * @example
     * // Delete a few Songs
     * const { count } = await prisma.song.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SongDeleteManyArgs>(args?: SelectSubset<T, SongDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Songs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Songs
     * const song = await prisma.song.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SongUpdateManyArgs>(args: SelectSubset<T, SongUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Songs and returns the data updated in the database.
     * @param {SongUpdateManyAndReturnArgs} args - Arguments to update many Songs.
     * @example
     * // Update many Songs
     * const song = await prisma.song.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Songs and only return the `id`
     * const songWithIdOnly = await prisma.song.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SongUpdateManyAndReturnArgs>(args: SelectSubset<T, SongUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Song.
     * @param {SongUpsertArgs} args - Arguments to update or create a Song.
     * @example
     * // Update or create a Song
     * const song = await prisma.song.upsert({
     *   create: {
     *     // ... data to create a Song
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Song we want to update
     *   }
     * })
     */
    upsert<T extends SongUpsertArgs>(args: SelectSubset<T, SongUpsertArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Songs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongCountArgs} args - Arguments to filter Songs to count.
     * @example
     * // Count the number of Songs
     * const count = await prisma.song.count({
     *   where: {
     *     // ... the filter for the Songs we want to count
     *   }
     * })
    **/
    count<T extends SongCountArgs>(
      args?: Subset<T, SongCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SongCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Song.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SongAggregateArgs>(args: Subset<T, SongAggregateArgs>): Prisma.PrismaPromise<GetSongAggregateType<T>>

    /**
     * Group by Song.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SongGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SongGroupByArgs['orderBy'] }
        : { orderBy?: SongGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SongGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSongGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Song model
   */
  readonly fields: SongFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Song.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SongClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    arrangements<T extends Song$arrangementsArgs<ExtArgs> = {}>(args?: Subset<T, Song$arrangementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Song model
   */
  interface SongFieldRefs {
    readonly id: FieldRef<"Song", 'Int'>
    readonly legacyId: FieldRef<"Song", 'Int'>
    readonly title: FieldRef<"Song", 'String'>
    readonly slug: FieldRef<"Song", 'String'>
    readonly lyrics: FieldRef<"Song", 'String'>
    readonly artist: FieldRef<"Song", 'String'>
    readonly isDeleted: FieldRef<"Song", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Song findUnique
   */
  export type SongFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter, which Song to fetch.
     */
    where: SongWhereUniqueInput
  }

  /**
   * Song findUniqueOrThrow
   */
  export type SongFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter, which Song to fetch.
     */
    where: SongWhereUniqueInput
  }

  /**
   * Song findFirst
   */
  export type SongFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter, which Song to fetch.
     */
    where?: SongWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Songs to fetch.
     */
    orderBy?: SongOrderByWithRelationInput | SongOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Songs.
     */
    cursor?: SongWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Songs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Songs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Songs.
     */
    distinct?: SongScalarFieldEnum | SongScalarFieldEnum[]
  }

  /**
   * Song findFirstOrThrow
   */
  export type SongFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter, which Song to fetch.
     */
    where?: SongWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Songs to fetch.
     */
    orderBy?: SongOrderByWithRelationInput | SongOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Songs.
     */
    cursor?: SongWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Songs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Songs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Songs.
     */
    distinct?: SongScalarFieldEnum | SongScalarFieldEnum[]
  }

  /**
   * Song findMany
   */
  export type SongFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter, which Songs to fetch.
     */
    where?: SongWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Songs to fetch.
     */
    orderBy?: SongOrderByWithRelationInput | SongOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Songs.
     */
    cursor?: SongWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Songs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Songs.
     */
    skip?: number
    distinct?: SongScalarFieldEnum | SongScalarFieldEnum[]
  }

  /**
   * Song create
   */
  export type SongCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * The data needed to create a Song.
     */
    data: XOR<SongCreateInput, SongUncheckedCreateInput>
  }

  /**
   * Song createMany
   */
  export type SongCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Songs.
     */
    data: SongCreateManyInput | SongCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Song createManyAndReturn
   */
  export type SongCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * The data used to create many Songs.
     */
    data: SongCreateManyInput | SongCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Song update
   */
  export type SongUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * The data needed to update a Song.
     */
    data: XOR<SongUpdateInput, SongUncheckedUpdateInput>
    /**
     * Choose, which Song to update.
     */
    where: SongWhereUniqueInput
  }

  /**
   * Song updateMany
   */
  export type SongUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Songs.
     */
    data: XOR<SongUpdateManyMutationInput, SongUncheckedUpdateManyInput>
    /**
     * Filter which Songs to update
     */
    where?: SongWhereInput
    /**
     * Limit how many Songs to update.
     */
    limit?: number
  }

  /**
   * Song updateManyAndReturn
   */
  export type SongUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * The data used to update Songs.
     */
    data: XOR<SongUpdateManyMutationInput, SongUncheckedUpdateManyInput>
    /**
     * Filter which Songs to update
     */
    where?: SongWhereInput
    /**
     * Limit how many Songs to update.
     */
    limit?: number
  }

  /**
   * Song upsert
   */
  export type SongUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * The filter to search for the Song to update in case it exists.
     */
    where: SongWhereUniqueInput
    /**
     * In case the Song found by the `where` argument doesn't exist, create a new Song with this data.
     */
    create: XOR<SongCreateInput, SongUncheckedCreateInput>
    /**
     * In case the Song was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SongUpdateInput, SongUncheckedUpdateInput>
  }

  /**
   * Song delete
   */
  export type SongDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
    /**
     * Filter which Song to delete.
     */
    where: SongWhereUniqueInput
  }

  /**
   * Song deleteMany
   */
  export type SongDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Songs to delete
     */
    where?: SongWhereInput
    /**
     * Limit how many Songs to delete.
     */
    limit?: number
  }

  /**
   * Song.arrangements
   */
  export type Song$arrangementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    where?: SongArrangementWhereInput
    orderBy?: SongArrangementOrderByWithRelationInput | SongArrangementOrderByWithRelationInput[]
    cursor?: SongArrangementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SongArrangementScalarFieldEnum | SongArrangementScalarFieldEnum[]
  }

  /**
   * Song without action
   */
  export type SongDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Song
     */
    select?: SongSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Song
     */
    omit?: SongOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongInclude<ExtArgs> | null
  }


  /**
   * Model SongArrangement
   */

  export type AggregateSongArrangement = {
    _count: SongArrangementCountAggregateOutputType | null
    _avg: SongArrangementAvgAggregateOutputType | null
    _sum: SongArrangementSumAggregateOutputType | null
    _min: SongArrangementMinAggregateOutputType | null
    _max: SongArrangementMaxAggregateOutputType | null
  }

  export type SongArrangementAvgAggregateOutputType = {
    id: number | null
    songId: number | null
  }

  export type SongArrangementSumAggregateOutputType = {
    id: number | null
    songId: number | null
  }

  export type SongArrangementMinAggregateOutputType = {
    id: number | null
    songId: number | null
    key: string | null
    name: string | null
    isDefault: boolean | null
    isDeleted: boolean | null
    isServiceArrangement: boolean | null
  }

  export type SongArrangementMaxAggregateOutputType = {
    id: number | null
    songId: number | null
    key: string | null
    name: string | null
    isDefault: boolean | null
    isDeleted: boolean | null
    isServiceArrangement: boolean | null
  }

  export type SongArrangementCountAggregateOutputType = {
    id: number
    songId: number
    key: number
    name: number
    isDefault: number
    isDeleted: number
    isServiceArrangement: number
    _all: number
  }


  export type SongArrangementAvgAggregateInputType = {
    id?: true
    songId?: true
  }

  export type SongArrangementSumAggregateInputType = {
    id?: true
    songId?: true
  }

  export type SongArrangementMinAggregateInputType = {
    id?: true
    songId?: true
    key?: true
    name?: true
    isDefault?: true
    isDeleted?: true
    isServiceArrangement?: true
  }

  export type SongArrangementMaxAggregateInputType = {
    id?: true
    songId?: true
    key?: true
    name?: true
    isDefault?: true
    isDeleted?: true
    isServiceArrangement?: true
  }

  export type SongArrangementCountAggregateInputType = {
    id?: true
    songId?: true
    key?: true
    name?: true
    isDefault?: true
    isDeleted?: true
    isServiceArrangement?: true
    _all?: true
  }

  export type SongArrangementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SongArrangement to aggregate.
     */
    where?: SongArrangementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongArrangements to fetch.
     */
    orderBy?: SongArrangementOrderByWithRelationInput | SongArrangementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SongArrangementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongArrangements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongArrangements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SongArrangements
    **/
    _count?: true | SongArrangementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SongArrangementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SongArrangementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SongArrangementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SongArrangementMaxAggregateInputType
  }

  export type GetSongArrangementAggregateType<T extends SongArrangementAggregateArgs> = {
        [P in keyof T & keyof AggregateSongArrangement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSongArrangement[P]>
      : GetScalarType<T[P], AggregateSongArrangement[P]>
  }




  export type SongArrangementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SongArrangementWhereInput
    orderBy?: SongArrangementOrderByWithAggregationInput | SongArrangementOrderByWithAggregationInput[]
    by: SongArrangementScalarFieldEnum[] | SongArrangementScalarFieldEnum
    having?: SongArrangementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SongArrangementCountAggregateInputType | true
    _avg?: SongArrangementAvgAggregateInputType
    _sum?: SongArrangementSumAggregateInputType
    _min?: SongArrangementMinAggregateInputType
    _max?: SongArrangementMaxAggregateInputType
  }

  export type SongArrangementGroupByOutputType = {
    id: number
    songId: number
    key: string
    name: string | null
    isDefault: boolean
    isDeleted: boolean
    isServiceArrangement: boolean
    _count: SongArrangementCountAggregateOutputType | null
    _avg: SongArrangementAvgAggregateOutputType | null
    _sum: SongArrangementSumAggregateOutputType | null
    _min: SongArrangementMinAggregateOutputType | null
    _max: SongArrangementMaxAggregateOutputType | null
  }

  type GetSongArrangementGroupByPayload<T extends SongArrangementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SongArrangementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SongArrangementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SongArrangementGroupByOutputType[P]>
            : GetScalarType<T[P], SongArrangementGroupByOutputType[P]>
        }
      >
    >


  export type SongArrangementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    songId?: boolean
    key?: boolean
    name?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song?: boolean | SongDefaultArgs<ExtArgs>
    serviceUnit?: boolean | SongArrangement$serviceUnitArgs<ExtArgs>
    units?: boolean | SongArrangement$unitsArgs<ExtArgs>
    _count?: boolean | SongArrangementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songArrangement"]>

  export type SongArrangementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    songId?: boolean
    key?: boolean
    name?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song?: boolean | SongDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songArrangement"]>

  export type SongArrangementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    songId?: boolean
    key?: boolean
    name?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song?: boolean | SongDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songArrangement"]>

  export type SongArrangementSelectScalar = {
    id?: boolean
    songId?: boolean
    key?: boolean
    name?: boolean
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
  }

  export type SongArrangementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "songId" | "key" | "name" | "isDefault" | "isDeleted" | "isServiceArrangement", ExtArgs["result"]["songArrangement"]>
  export type SongArrangementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    song?: boolean | SongDefaultArgs<ExtArgs>
    serviceUnit?: boolean | SongArrangement$serviceUnitArgs<ExtArgs>
    units?: boolean | SongArrangement$unitsArgs<ExtArgs>
    _count?: boolean | SongArrangementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SongArrangementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    song?: boolean | SongDefaultArgs<ExtArgs>
  }
  export type SongArrangementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    song?: boolean | SongDefaultArgs<ExtArgs>
  }

  export type $SongArrangementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SongArrangement"
    objects: {
      song: Prisma.$SongPayload<ExtArgs>
      serviceUnit: Prisma.$ServiceUnitPayload<ExtArgs> | null
      units: Prisma.$SongUnitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      songId: number
      key: string
      name: string | null
      isDefault: boolean
      isDeleted: boolean
      isServiceArrangement: boolean
    }, ExtArgs["result"]["songArrangement"]>
    composites: {}
  }

  type SongArrangementGetPayload<S extends boolean | null | undefined | SongArrangementDefaultArgs> = $Result.GetResult<Prisma.$SongArrangementPayload, S>

  type SongArrangementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SongArrangementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SongArrangementCountAggregateInputType | true
    }

  export interface SongArrangementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SongArrangement'], meta: { name: 'SongArrangement' } }
    /**
     * Find zero or one SongArrangement that matches the filter.
     * @param {SongArrangementFindUniqueArgs} args - Arguments to find a SongArrangement
     * @example
     * // Get one SongArrangement
     * const songArrangement = await prisma.songArrangement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SongArrangementFindUniqueArgs>(args: SelectSubset<T, SongArrangementFindUniqueArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SongArrangement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SongArrangementFindUniqueOrThrowArgs} args - Arguments to find a SongArrangement
     * @example
     * // Get one SongArrangement
     * const songArrangement = await prisma.songArrangement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SongArrangementFindUniqueOrThrowArgs>(args: SelectSubset<T, SongArrangementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SongArrangement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementFindFirstArgs} args - Arguments to find a SongArrangement
     * @example
     * // Get one SongArrangement
     * const songArrangement = await prisma.songArrangement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SongArrangementFindFirstArgs>(args?: SelectSubset<T, SongArrangementFindFirstArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SongArrangement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementFindFirstOrThrowArgs} args - Arguments to find a SongArrangement
     * @example
     * // Get one SongArrangement
     * const songArrangement = await prisma.songArrangement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SongArrangementFindFirstOrThrowArgs>(args?: SelectSubset<T, SongArrangementFindFirstOrThrowArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SongArrangements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SongArrangements
     * const songArrangements = await prisma.songArrangement.findMany()
     * 
     * // Get first 10 SongArrangements
     * const songArrangements = await prisma.songArrangement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const songArrangementWithIdOnly = await prisma.songArrangement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SongArrangementFindManyArgs>(args?: SelectSubset<T, SongArrangementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SongArrangement.
     * @param {SongArrangementCreateArgs} args - Arguments to create a SongArrangement.
     * @example
     * // Create one SongArrangement
     * const SongArrangement = await prisma.songArrangement.create({
     *   data: {
     *     // ... data to create a SongArrangement
     *   }
     * })
     * 
     */
    create<T extends SongArrangementCreateArgs>(args: SelectSubset<T, SongArrangementCreateArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SongArrangements.
     * @param {SongArrangementCreateManyArgs} args - Arguments to create many SongArrangements.
     * @example
     * // Create many SongArrangements
     * const songArrangement = await prisma.songArrangement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SongArrangementCreateManyArgs>(args?: SelectSubset<T, SongArrangementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SongArrangements and returns the data saved in the database.
     * @param {SongArrangementCreateManyAndReturnArgs} args - Arguments to create many SongArrangements.
     * @example
     * // Create many SongArrangements
     * const songArrangement = await prisma.songArrangement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SongArrangements and only return the `id`
     * const songArrangementWithIdOnly = await prisma.songArrangement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SongArrangementCreateManyAndReturnArgs>(args?: SelectSubset<T, SongArrangementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SongArrangement.
     * @param {SongArrangementDeleteArgs} args - Arguments to delete one SongArrangement.
     * @example
     * // Delete one SongArrangement
     * const SongArrangement = await prisma.songArrangement.delete({
     *   where: {
     *     // ... filter to delete one SongArrangement
     *   }
     * })
     * 
     */
    delete<T extends SongArrangementDeleteArgs>(args: SelectSubset<T, SongArrangementDeleteArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SongArrangement.
     * @param {SongArrangementUpdateArgs} args - Arguments to update one SongArrangement.
     * @example
     * // Update one SongArrangement
     * const songArrangement = await prisma.songArrangement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SongArrangementUpdateArgs>(args: SelectSubset<T, SongArrangementUpdateArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SongArrangements.
     * @param {SongArrangementDeleteManyArgs} args - Arguments to filter SongArrangements to delete.
     * @example
     * // Delete a few SongArrangements
     * const { count } = await prisma.songArrangement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SongArrangementDeleteManyArgs>(args?: SelectSubset<T, SongArrangementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SongArrangements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SongArrangements
     * const songArrangement = await prisma.songArrangement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SongArrangementUpdateManyArgs>(args: SelectSubset<T, SongArrangementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SongArrangements and returns the data updated in the database.
     * @param {SongArrangementUpdateManyAndReturnArgs} args - Arguments to update many SongArrangements.
     * @example
     * // Update many SongArrangements
     * const songArrangement = await prisma.songArrangement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SongArrangements and only return the `id`
     * const songArrangementWithIdOnly = await prisma.songArrangement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SongArrangementUpdateManyAndReturnArgs>(args: SelectSubset<T, SongArrangementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SongArrangement.
     * @param {SongArrangementUpsertArgs} args - Arguments to update or create a SongArrangement.
     * @example
     * // Update or create a SongArrangement
     * const songArrangement = await prisma.songArrangement.upsert({
     *   create: {
     *     // ... data to create a SongArrangement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SongArrangement we want to update
     *   }
     * })
     */
    upsert<T extends SongArrangementUpsertArgs>(args: SelectSubset<T, SongArrangementUpsertArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SongArrangements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementCountArgs} args - Arguments to filter SongArrangements to count.
     * @example
     * // Count the number of SongArrangements
     * const count = await prisma.songArrangement.count({
     *   where: {
     *     // ... the filter for the SongArrangements we want to count
     *   }
     * })
    **/
    count<T extends SongArrangementCountArgs>(
      args?: Subset<T, SongArrangementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SongArrangementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SongArrangement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SongArrangementAggregateArgs>(args: Subset<T, SongArrangementAggregateArgs>): Prisma.PrismaPromise<GetSongArrangementAggregateType<T>>

    /**
     * Group by SongArrangement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongArrangementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SongArrangementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SongArrangementGroupByArgs['orderBy'] }
        : { orderBy?: SongArrangementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SongArrangementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSongArrangementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SongArrangement model
   */
  readonly fields: SongArrangementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SongArrangement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SongArrangementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    song<T extends SongDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SongDefaultArgs<ExtArgs>>): Prisma__SongClient<$Result.GetResult<Prisma.$SongPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    serviceUnit<T extends SongArrangement$serviceUnitArgs<ExtArgs> = {}>(args?: Subset<T, SongArrangement$serviceUnitArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    units<T extends SongArrangement$unitsArgs<ExtArgs> = {}>(args?: Subset<T, SongArrangement$unitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SongArrangement model
   */
  interface SongArrangementFieldRefs {
    readonly id: FieldRef<"SongArrangement", 'Int'>
    readonly songId: FieldRef<"SongArrangement", 'Int'>
    readonly key: FieldRef<"SongArrangement", 'String'>
    readonly name: FieldRef<"SongArrangement", 'String'>
    readonly isDefault: FieldRef<"SongArrangement", 'Boolean'>
    readonly isDeleted: FieldRef<"SongArrangement", 'Boolean'>
    readonly isServiceArrangement: FieldRef<"SongArrangement", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * SongArrangement findUnique
   */
  export type SongArrangementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter, which SongArrangement to fetch.
     */
    where: SongArrangementWhereUniqueInput
  }

  /**
   * SongArrangement findUniqueOrThrow
   */
  export type SongArrangementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter, which SongArrangement to fetch.
     */
    where: SongArrangementWhereUniqueInput
  }

  /**
   * SongArrangement findFirst
   */
  export type SongArrangementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter, which SongArrangement to fetch.
     */
    where?: SongArrangementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongArrangements to fetch.
     */
    orderBy?: SongArrangementOrderByWithRelationInput | SongArrangementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SongArrangements.
     */
    cursor?: SongArrangementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongArrangements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongArrangements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SongArrangements.
     */
    distinct?: SongArrangementScalarFieldEnum | SongArrangementScalarFieldEnum[]
  }

  /**
   * SongArrangement findFirstOrThrow
   */
  export type SongArrangementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter, which SongArrangement to fetch.
     */
    where?: SongArrangementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongArrangements to fetch.
     */
    orderBy?: SongArrangementOrderByWithRelationInput | SongArrangementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SongArrangements.
     */
    cursor?: SongArrangementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongArrangements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongArrangements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SongArrangements.
     */
    distinct?: SongArrangementScalarFieldEnum | SongArrangementScalarFieldEnum[]
  }

  /**
   * SongArrangement findMany
   */
  export type SongArrangementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter, which SongArrangements to fetch.
     */
    where?: SongArrangementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongArrangements to fetch.
     */
    orderBy?: SongArrangementOrderByWithRelationInput | SongArrangementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SongArrangements.
     */
    cursor?: SongArrangementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongArrangements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongArrangements.
     */
    skip?: number
    distinct?: SongArrangementScalarFieldEnum | SongArrangementScalarFieldEnum[]
  }

  /**
   * SongArrangement create
   */
  export type SongArrangementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * The data needed to create a SongArrangement.
     */
    data: XOR<SongArrangementCreateInput, SongArrangementUncheckedCreateInput>
  }

  /**
   * SongArrangement createMany
   */
  export type SongArrangementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SongArrangements.
     */
    data: SongArrangementCreateManyInput | SongArrangementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SongArrangement createManyAndReturn
   */
  export type SongArrangementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * The data used to create many SongArrangements.
     */
    data: SongArrangementCreateManyInput | SongArrangementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SongArrangement update
   */
  export type SongArrangementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * The data needed to update a SongArrangement.
     */
    data: XOR<SongArrangementUpdateInput, SongArrangementUncheckedUpdateInput>
    /**
     * Choose, which SongArrangement to update.
     */
    where: SongArrangementWhereUniqueInput
  }

  /**
   * SongArrangement updateMany
   */
  export type SongArrangementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SongArrangements.
     */
    data: XOR<SongArrangementUpdateManyMutationInput, SongArrangementUncheckedUpdateManyInput>
    /**
     * Filter which SongArrangements to update
     */
    where?: SongArrangementWhereInput
    /**
     * Limit how many SongArrangements to update.
     */
    limit?: number
  }

  /**
   * SongArrangement updateManyAndReturn
   */
  export type SongArrangementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * The data used to update SongArrangements.
     */
    data: XOR<SongArrangementUpdateManyMutationInput, SongArrangementUncheckedUpdateManyInput>
    /**
     * Filter which SongArrangements to update
     */
    where?: SongArrangementWhereInput
    /**
     * Limit how many SongArrangements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SongArrangement upsert
   */
  export type SongArrangementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * The filter to search for the SongArrangement to update in case it exists.
     */
    where: SongArrangementWhereUniqueInput
    /**
     * In case the SongArrangement found by the `where` argument doesn't exist, create a new SongArrangement with this data.
     */
    create: XOR<SongArrangementCreateInput, SongArrangementUncheckedCreateInput>
    /**
     * In case the SongArrangement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SongArrangementUpdateInput, SongArrangementUncheckedUpdateInput>
  }

  /**
   * SongArrangement delete
   */
  export type SongArrangementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    /**
     * Filter which SongArrangement to delete.
     */
    where: SongArrangementWhereUniqueInput
  }

  /**
   * SongArrangement deleteMany
   */
  export type SongArrangementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SongArrangements to delete
     */
    where?: SongArrangementWhereInput
    /**
     * Limit how many SongArrangements to delete.
     */
    limit?: number
  }

  /**
   * SongArrangement.serviceUnit
   */
  export type SongArrangement$serviceUnitArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    where?: ServiceUnitWhereInput
  }

  /**
   * SongArrangement.units
   */
  export type SongArrangement$unitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    where?: SongUnitWhereInput
    orderBy?: SongUnitOrderByWithRelationInput | SongUnitOrderByWithRelationInput[]
    cursor?: SongUnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SongUnitScalarFieldEnum | SongUnitScalarFieldEnum[]
  }

  /**
   * SongArrangement without action
   */
  export type SongArrangementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
  }


  /**
   * Model SongUnit
   */

  export type AggregateSongUnit = {
    _count: SongUnitCountAggregateOutputType | null
    _avg: SongUnitAvgAggregateOutputType | null
    _sum: SongUnitSumAggregateOutputType | null
    _min: SongUnitMinAggregateOutputType | null
    _max: SongUnitMaxAggregateOutputType | null
  }

  export type SongUnitAvgAggregateOutputType = {
    id: number | null
    arrangementId: number | null
    order: number | null
  }

  export type SongUnitSumAggregateOutputType = {
    id: number | null
    arrangementId: number | null
    order: number | null
  }

  export type SongUnitMinAggregateOutputType = {
    id: number | null
    arrangementId: number | null
    content: string | null
    type: $Enums.SongUnitType | null
    order: number | null
  }

  export type SongUnitMaxAggregateOutputType = {
    id: number | null
    arrangementId: number | null
    content: string | null
    type: $Enums.SongUnitType | null
    order: number | null
  }

  export type SongUnitCountAggregateOutputType = {
    id: number
    arrangementId: number
    content: number
    type: number
    order: number
    _all: number
  }


  export type SongUnitAvgAggregateInputType = {
    id?: true
    arrangementId?: true
    order?: true
  }

  export type SongUnitSumAggregateInputType = {
    id?: true
    arrangementId?: true
    order?: true
  }

  export type SongUnitMinAggregateInputType = {
    id?: true
    arrangementId?: true
    content?: true
    type?: true
    order?: true
  }

  export type SongUnitMaxAggregateInputType = {
    id?: true
    arrangementId?: true
    content?: true
    type?: true
    order?: true
  }

  export type SongUnitCountAggregateInputType = {
    id?: true
    arrangementId?: true
    content?: true
    type?: true
    order?: true
    _all?: true
  }

  export type SongUnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SongUnit to aggregate.
     */
    where?: SongUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongUnits to fetch.
     */
    orderBy?: SongUnitOrderByWithRelationInput | SongUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SongUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SongUnits
    **/
    _count?: true | SongUnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SongUnitAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SongUnitSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SongUnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SongUnitMaxAggregateInputType
  }

  export type GetSongUnitAggregateType<T extends SongUnitAggregateArgs> = {
        [P in keyof T & keyof AggregateSongUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSongUnit[P]>
      : GetScalarType<T[P], AggregateSongUnit[P]>
  }




  export type SongUnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SongUnitWhereInput
    orderBy?: SongUnitOrderByWithAggregationInput | SongUnitOrderByWithAggregationInput[]
    by: SongUnitScalarFieldEnum[] | SongUnitScalarFieldEnum
    having?: SongUnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SongUnitCountAggregateInputType | true
    _avg?: SongUnitAvgAggregateInputType
    _sum?: SongUnitSumAggregateInputType
    _min?: SongUnitMinAggregateInputType
    _max?: SongUnitMaxAggregateInputType
  }

  export type SongUnitGroupByOutputType = {
    id: number
    arrangementId: number
    content: string
    type: $Enums.SongUnitType
    order: number
    _count: SongUnitCountAggregateOutputType | null
    _avg: SongUnitAvgAggregateOutputType | null
    _sum: SongUnitSumAggregateOutputType | null
    _min: SongUnitMinAggregateOutputType | null
    _max: SongUnitMaxAggregateOutputType | null
  }

  type GetSongUnitGroupByPayload<T extends SongUnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SongUnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SongUnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SongUnitGroupByOutputType[P]>
            : GetScalarType<T[P], SongUnitGroupByOutputType[P]>
        }
      >
    >


  export type SongUnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    arrangementId?: boolean
    content?: boolean
    type?: boolean
    order?: boolean
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songUnit"]>

  export type SongUnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    arrangementId?: boolean
    content?: boolean
    type?: boolean
    order?: boolean
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songUnit"]>

  export type SongUnitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    arrangementId?: boolean
    content?: boolean
    type?: boolean
    order?: boolean
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["songUnit"]>

  export type SongUnitSelectScalar = {
    id?: boolean
    arrangementId?: boolean
    content?: boolean
    type?: boolean
    order?: boolean
  }

  export type SongUnitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "arrangementId" | "content" | "type" | "order", ExtArgs["result"]["songUnit"]>
  export type SongUnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }
  export type SongUnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }
  export type SongUnitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    arrangement?: boolean | SongArrangementDefaultArgs<ExtArgs>
  }

  export type $SongUnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SongUnit"
    objects: {
      arrangement: Prisma.$SongArrangementPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      arrangementId: number
      content: string
      type: $Enums.SongUnitType
      order: number
    }, ExtArgs["result"]["songUnit"]>
    composites: {}
  }

  type SongUnitGetPayload<S extends boolean | null | undefined | SongUnitDefaultArgs> = $Result.GetResult<Prisma.$SongUnitPayload, S>

  type SongUnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SongUnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SongUnitCountAggregateInputType | true
    }

  export interface SongUnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SongUnit'], meta: { name: 'SongUnit' } }
    /**
     * Find zero or one SongUnit that matches the filter.
     * @param {SongUnitFindUniqueArgs} args - Arguments to find a SongUnit
     * @example
     * // Get one SongUnit
     * const songUnit = await prisma.songUnit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SongUnitFindUniqueArgs>(args: SelectSubset<T, SongUnitFindUniqueArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SongUnit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SongUnitFindUniqueOrThrowArgs} args - Arguments to find a SongUnit
     * @example
     * // Get one SongUnit
     * const songUnit = await prisma.songUnit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SongUnitFindUniqueOrThrowArgs>(args: SelectSubset<T, SongUnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SongUnit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitFindFirstArgs} args - Arguments to find a SongUnit
     * @example
     * // Get one SongUnit
     * const songUnit = await prisma.songUnit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SongUnitFindFirstArgs>(args?: SelectSubset<T, SongUnitFindFirstArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SongUnit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitFindFirstOrThrowArgs} args - Arguments to find a SongUnit
     * @example
     * // Get one SongUnit
     * const songUnit = await prisma.songUnit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SongUnitFindFirstOrThrowArgs>(args?: SelectSubset<T, SongUnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SongUnits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SongUnits
     * const songUnits = await prisma.songUnit.findMany()
     * 
     * // Get first 10 SongUnits
     * const songUnits = await prisma.songUnit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const songUnitWithIdOnly = await prisma.songUnit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SongUnitFindManyArgs>(args?: SelectSubset<T, SongUnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SongUnit.
     * @param {SongUnitCreateArgs} args - Arguments to create a SongUnit.
     * @example
     * // Create one SongUnit
     * const SongUnit = await prisma.songUnit.create({
     *   data: {
     *     // ... data to create a SongUnit
     *   }
     * })
     * 
     */
    create<T extends SongUnitCreateArgs>(args: SelectSubset<T, SongUnitCreateArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SongUnits.
     * @param {SongUnitCreateManyArgs} args - Arguments to create many SongUnits.
     * @example
     * // Create many SongUnits
     * const songUnit = await prisma.songUnit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SongUnitCreateManyArgs>(args?: SelectSubset<T, SongUnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SongUnits and returns the data saved in the database.
     * @param {SongUnitCreateManyAndReturnArgs} args - Arguments to create many SongUnits.
     * @example
     * // Create many SongUnits
     * const songUnit = await prisma.songUnit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SongUnits and only return the `id`
     * const songUnitWithIdOnly = await prisma.songUnit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SongUnitCreateManyAndReturnArgs>(args?: SelectSubset<T, SongUnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SongUnit.
     * @param {SongUnitDeleteArgs} args - Arguments to delete one SongUnit.
     * @example
     * // Delete one SongUnit
     * const SongUnit = await prisma.songUnit.delete({
     *   where: {
     *     // ... filter to delete one SongUnit
     *   }
     * })
     * 
     */
    delete<T extends SongUnitDeleteArgs>(args: SelectSubset<T, SongUnitDeleteArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SongUnit.
     * @param {SongUnitUpdateArgs} args - Arguments to update one SongUnit.
     * @example
     * // Update one SongUnit
     * const songUnit = await prisma.songUnit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SongUnitUpdateArgs>(args: SelectSubset<T, SongUnitUpdateArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SongUnits.
     * @param {SongUnitDeleteManyArgs} args - Arguments to filter SongUnits to delete.
     * @example
     * // Delete a few SongUnits
     * const { count } = await prisma.songUnit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SongUnitDeleteManyArgs>(args?: SelectSubset<T, SongUnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SongUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SongUnits
     * const songUnit = await prisma.songUnit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SongUnitUpdateManyArgs>(args: SelectSubset<T, SongUnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SongUnits and returns the data updated in the database.
     * @param {SongUnitUpdateManyAndReturnArgs} args - Arguments to update many SongUnits.
     * @example
     * // Update many SongUnits
     * const songUnit = await prisma.songUnit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SongUnits and only return the `id`
     * const songUnitWithIdOnly = await prisma.songUnit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SongUnitUpdateManyAndReturnArgs>(args: SelectSubset<T, SongUnitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SongUnit.
     * @param {SongUnitUpsertArgs} args - Arguments to update or create a SongUnit.
     * @example
     * // Update or create a SongUnit
     * const songUnit = await prisma.songUnit.upsert({
     *   create: {
     *     // ... data to create a SongUnit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SongUnit we want to update
     *   }
     * })
     */
    upsert<T extends SongUnitUpsertArgs>(args: SelectSubset<T, SongUnitUpsertArgs<ExtArgs>>): Prisma__SongUnitClient<$Result.GetResult<Prisma.$SongUnitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SongUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitCountArgs} args - Arguments to filter SongUnits to count.
     * @example
     * // Count the number of SongUnits
     * const count = await prisma.songUnit.count({
     *   where: {
     *     // ... the filter for the SongUnits we want to count
     *   }
     * })
    **/
    count<T extends SongUnitCountArgs>(
      args?: Subset<T, SongUnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SongUnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SongUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SongUnitAggregateArgs>(args: Subset<T, SongUnitAggregateArgs>): Prisma.PrismaPromise<GetSongUnitAggregateType<T>>

    /**
     * Group by SongUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SongUnitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SongUnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SongUnitGroupByArgs['orderBy'] }
        : { orderBy?: SongUnitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SongUnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSongUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SongUnit model
   */
  readonly fields: SongUnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SongUnit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SongUnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    arrangement<T extends SongArrangementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SongArrangementDefaultArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SongUnit model
   */
  interface SongUnitFieldRefs {
    readonly id: FieldRef<"SongUnit", 'Int'>
    readonly arrangementId: FieldRef<"SongUnit", 'Int'>
    readonly content: FieldRef<"SongUnit", 'String'>
    readonly type: FieldRef<"SongUnit", 'SongUnitType'>
    readonly order: FieldRef<"SongUnit", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * SongUnit findUnique
   */
  export type SongUnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter, which SongUnit to fetch.
     */
    where: SongUnitWhereUniqueInput
  }

  /**
   * SongUnit findUniqueOrThrow
   */
  export type SongUnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter, which SongUnit to fetch.
     */
    where: SongUnitWhereUniqueInput
  }

  /**
   * SongUnit findFirst
   */
  export type SongUnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter, which SongUnit to fetch.
     */
    where?: SongUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongUnits to fetch.
     */
    orderBy?: SongUnitOrderByWithRelationInput | SongUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SongUnits.
     */
    cursor?: SongUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SongUnits.
     */
    distinct?: SongUnitScalarFieldEnum | SongUnitScalarFieldEnum[]
  }

  /**
   * SongUnit findFirstOrThrow
   */
  export type SongUnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter, which SongUnit to fetch.
     */
    where?: SongUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongUnits to fetch.
     */
    orderBy?: SongUnitOrderByWithRelationInput | SongUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SongUnits.
     */
    cursor?: SongUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SongUnits.
     */
    distinct?: SongUnitScalarFieldEnum | SongUnitScalarFieldEnum[]
  }

  /**
   * SongUnit findMany
   */
  export type SongUnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter, which SongUnits to fetch.
     */
    where?: SongUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SongUnits to fetch.
     */
    orderBy?: SongUnitOrderByWithRelationInput | SongUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SongUnits.
     */
    cursor?: SongUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SongUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SongUnits.
     */
    skip?: number
    distinct?: SongUnitScalarFieldEnum | SongUnitScalarFieldEnum[]
  }

  /**
   * SongUnit create
   */
  export type SongUnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * The data needed to create a SongUnit.
     */
    data: XOR<SongUnitCreateInput, SongUnitUncheckedCreateInput>
  }

  /**
   * SongUnit createMany
   */
  export type SongUnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SongUnits.
     */
    data: SongUnitCreateManyInput | SongUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SongUnit createManyAndReturn
   */
  export type SongUnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * The data used to create many SongUnits.
     */
    data: SongUnitCreateManyInput | SongUnitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SongUnit update
   */
  export type SongUnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * The data needed to update a SongUnit.
     */
    data: XOR<SongUnitUpdateInput, SongUnitUncheckedUpdateInput>
    /**
     * Choose, which SongUnit to update.
     */
    where: SongUnitWhereUniqueInput
  }

  /**
   * SongUnit updateMany
   */
  export type SongUnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SongUnits.
     */
    data: XOR<SongUnitUpdateManyMutationInput, SongUnitUncheckedUpdateManyInput>
    /**
     * Filter which SongUnits to update
     */
    where?: SongUnitWhereInput
    /**
     * Limit how many SongUnits to update.
     */
    limit?: number
  }

  /**
   * SongUnit updateManyAndReturn
   */
  export type SongUnitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * The data used to update SongUnits.
     */
    data: XOR<SongUnitUpdateManyMutationInput, SongUnitUncheckedUpdateManyInput>
    /**
     * Filter which SongUnits to update
     */
    where?: SongUnitWhereInput
    /**
     * Limit how many SongUnits to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SongUnit upsert
   */
  export type SongUnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * The filter to search for the SongUnit to update in case it exists.
     */
    where: SongUnitWhereUniqueInput
    /**
     * In case the SongUnit found by the `where` argument doesn't exist, create a new SongUnit with this data.
     */
    create: XOR<SongUnitCreateInput, SongUnitUncheckedCreateInput>
    /**
     * In case the SongUnit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SongUnitUpdateInput, SongUnitUncheckedUpdateInput>
  }

  /**
   * SongUnit delete
   */
  export type SongUnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
    /**
     * Filter which SongUnit to delete.
     */
    where: SongUnitWhereUniqueInput
  }

  /**
   * SongUnit deleteMany
   */
  export type SongUnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SongUnits to delete
     */
    where?: SongUnitWhereInput
    /**
     * Limit how many SongUnits to delete.
     */
    limit?: number
  }

  /**
   * SongUnit without action
   */
  export type SongUnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongUnit
     */
    select?: SongUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongUnit
     */
    omit?: SongUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongUnitInclude<ExtArgs> | null
  }


  /**
   * Model Service
   */

  export type AggregateService = {
    _count: ServiceCountAggregateOutputType | null
    _avg: ServiceAvgAggregateOutputType | null
    _sum: ServiceSumAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  export type ServiceAvgAggregateOutputType = {
    id: number | null
    legacyId: number | null
  }

  export type ServiceSumAggregateOutputType = {
    id: number | null
    legacyId: number | null
  }

  export type ServiceMinAggregateOutputType = {
    id: number | null
    legacyId: number | null
    title: string | null
    slug: string | null
    worshipLeader: string | null
    date: Date | null
    isDeleted: boolean | null
  }

  export type ServiceMaxAggregateOutputType = {
    id: number | null
    legacyId: number | null
    title: string | null
    slug: string | null
    worshipLeader: string | null
    date: Date | null
    isDeleted: boolean | null
  }

  export type ServiceCountAggregateOutputType = {
    id: number
    legacyId: number
    title: number
    slug: number
    worshipLeader: number
    date: number
    isDeleted: number
    _all: number
  }


  export type ServiceAvgAggregateInputType = {
    id?: true
    legacyId?: true
  }

  export type ServiceSumAggregateInputType = {
    id?: true
    legacyId?: true
  }

  export type ServiceMinAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    worshipLeader?: true
    date?: true
    isDeleted?: true
  }

  export type ServiceMaxAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    worshipLeader?: true
    date?: true
    isDeleted?: true
  }

  export type ServiceCountAggregateInputType = {
    id?: true
    legacyId?: true
    title?: true
    slug?: true
    worshipLeader?: true
    date?: true
    isDeleted?: true
    _all?: true
  }

  export type ServiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Service to aggregate.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Services
    **/
    _count?: true | ServiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ServiceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ServiceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceMaxAggregateInputType
  }

  export type GetServiceAggregateType<T extends ServiceAggregateArgs> = {
        [P in keyof T & keyof AggregateService]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateService[P]>
      : GetScalarType<T[P], AggregateService[P]>
  }




  export type ServiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceWhereInput
    orderBy?: ServiceOrderByWithAggregationInput | ServiceOrderByWithAggregationInput[]
    by: ServiceScalarFieldEnum[] | ServiceScalarFieldEnum
    having?: ServiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceCountAggregateInputType | true
    _avg?: ServiceAvgAggregateInputType
    _sum?: ServiceSumAggregateInputType
    _min?: ServiceMinAggregateInputType
    _max?: ServiceMaxAggregateInputType
  }

  export type ServiceGroupByOutputType = {
    id: number
    legacyId: number | null
    title: string | null
    slug: string
    worshipLeader: string | null
    date: Date
    isDeleted: boolean
    _count: ServiceCountAggregateOutputType | null
    _avg: ServiceAvgAggregateOutputType | null
    _sum: ServiceSumAggregateOutputType | null
    _min: ServiceMinAggregateOutputType | null
    _max: ServiceMaxAggregateOutputType | null
  }

  type GetServiceGroupByPayload<T extends ServiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceGroupByOutputType[P]>
        }
      >
    >


  export type ServiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    worshipLeader?: boolean
    date?: boolean
    isDeleted?: boolean
    units?: boolean | Service$unitsArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    worshipLeader?: boolean
    date?: boolean
    isDeleted?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    worshipLeader?: boolean
    date?: boolean
    isDeleted?: boolean
  }, ExtArgs["result"]["service"]>

  export type ServiceSelectScalar = {
    id?: boolean
    legacyId?: boolean
    title?: boolean
    slug?: boolean
    worshipLeader?: boolean
    date?: boolean
    isDeleted?: boolean
  }

  export type ServiceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "legacyId" | "title" | "slug" | "worshipLeader" | "date" | "isDeleted", ExtArgs["result"]["service"]>
  export type ServiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    units?: boolean | Service$unitsArgs<ExtArgs>
    _count?: boolean | ServiceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ServiceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ServiceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ServicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Service"
    objects: {
      units: Prisma.$ServiceUnitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      legacyId: number | null
      title: string | null
      slug: string
      worshipLeader: string | null
      date: Date
      isDeleted: boolean
    }, ExtArgs["result"]["service"]>
    composites: {}
  }

  type ServiceGetPayload<S extends boolean | null | undefined | ServiceDefaultArgs> = $Result.GetResult<Prisma.$ServicePayload, S>

  type ServiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceCountAggregateInputType | true
    }

  export interface ServiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Service'], meta: { name: 'Service' } }
    /**
     * Find zero or one Service that matches the filter.
     * @param {ServiceFindUniqueArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceFindUniqueArgs>(args: SelectSubset<T, ServiceFindUniqueArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Service that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceFindUniqueOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceFindFirstArgs>(args?: SelectSubset<T, ServiceFindFirstArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Service that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindFirstOrThrowArgs} args - Arguments to find a Service
     * @example
     * // Get one Service
     * const service = await prisma.service.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Services that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Services
     * const services = await prisma.service.findMany()
     * 
     * // Get first 10 Services
     * const services = await prisma.service.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceWithIdOnly = await prisma.service.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceFindManyArgs>(args?: SelectSubset<T, ServiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Service.
     * @param {ServiceCreateArgs} args - Arguments to create a Service.
     * @example
     * // Create one Service
     * const Service = await prisma.service.create({
     *   data: {
     *     // ... data to create a Service
     *   }
     * })
     * 
     */
    create<T extends ServiceCreateArgs>(args: SelectSubset<T, ServiceCreateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Services.
     * @param {ServiceCreateManyArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceCreateManyArgs>(args?: SelectSubset<T, ServiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Services and returns the data saved in the database.
     * @param {ServiceCreateManyAndReturnArgs} args - Arguments to create many Services.
     * @example
     * // Create many Services
     * const service = await prisma.service.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Service.
     * @param {ServiceDeleteArgs} args - Arguments to delete one Service.
     * @example
     * // Delete one Service
     * const Service = await prisma.service.delete({
     *   where: {
     *     // ... filter to delete one Service
     *   }
     * })
     * 
     */
    delete<T extends ServiceDeleteArgs>(args: SelectSubset<T, ServiceDeleteArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Service.
     * @param {ServiceUpdateArgs} args - Arguments to update one Service.
     * @example
     * // Update one Service
     * const service = await prisma.service.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceUpdateArgs>(args: SelectSubset<T, ServiceUpdateArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Services.
     * @param {ServiceDeleteManyArgs} args - Arguments to filter Services to delete.
     * @example
     * // Delete a few Services
     * const { count } = await prisma.service.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceDeleteManyArgs>(args?: SelectSubset<T, ServiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceUpdateManyArgs>(args: SelectSubset<T, ServiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Services and returns the data updated in the database.
     * @param {ServiceUpdateManyAndReturnArgs} args - Arguments to update many Services.
     * @example
     * // Update many Services
     * const service = await prisma.service.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Services and only return the `id`
     * const serviceWithIdOnly = await prisma.service.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServiceUpdateManyAndReturnArgs>(args: SelectSubset<T, ServiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Service.
     * @param {ServiceUpsertArgs} args - Arguments to update or create a Service.
     * @example
     * // Update or create a Service
     * const service = await prisma.service.upsert({
     *   create: {
     *     // ... data to create a Service
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Service we want to update
     *   }
     * })
     */
    upsert<T extends ServiceUpsertArgs>(args: SelectSubset<T, ServiceUpsertArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Services.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceCountArgs} args - Arguments to filter Services to count.
     * @example
     * // Count the number of Services
     * const count = await prisma.service.count({
     *   where: {
     *     // ... the filter for the Services we want to count
     *   }
     * })
    **/
    count<T extends ServiceCountArgs>(
      args?: Subset<T, ServiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceAggregateArgs>(args: Subset<T, ServiceAggregateArgs>): Prisma.PrismaPromise<GetServiceAggregateType<T>>

    /**
     * Group by Service.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceGroupByArgs['orderBy'] }
        : { orderBy?: ServiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Service model
   */
  readonly fields: ServiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Service.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    units<T extends Service$unitsArgs<ExtArgs> = {}>(args?: Subset<T, Service$unitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Service model
   */
  interface ServiceFieldRefs {
    readonly id: FieldRef<"Service", 'Int'>
    readonly legacyId: FieldRef<"Service", 'Int'>
    readonly title: FieldRef<"Service", 'String'>
    readonly slug: FieldRef<"Service", 'String'>
    readonly worshipLeader: FieldRef<"Service", 'String'>
    readonly date: FieldRef<"Service", 'DateTime'>
    readonly isDeleted: FieldRef<"Service", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Service findUnique
   */
  export type ServiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findUniqueOrThrow
   */
  export type ServiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service findFirst
   */
  export type ServiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findFirstOrThrow
   */
  export type ServiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Service to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Services.
     */
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service findMany
   */
  export type ServiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter, which Services to fetch.
     */
    where?: ServiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Services to fetch.
     */
    orderBy?: ServiceOrderByWithRelationInput | ServiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Services.
     */
    cursor?: ServiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Services from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Services.
     */
    skip?: number
    distinct?: ServiceScalarFieldEnum | ServiceScalarFieldEnum[]
  }

  /**
   * Service create
   */
  export type ServiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Service.
     */
    data: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
  }

  /**
   * Service createMany
   */
  export type ServiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service createManyAndReturn
   */
  export type ServiceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to create many Services.
     */
    data: ServiceCreateManyInput | ServiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Service update
   */
  export type ServiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Service.
     */
    data: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
    /**
     * Choose, which Service to update.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service updateMany
   */
  export type ServiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service updateManyAndReturn
   */
  export type ServiceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * The data used to update Services.
     */
    data: XOR<ServiceUpdateManyMutationInput, ServiceUncheckedUpdateManyInput>
    /**
     * Filter which Services to update
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to update.
     */
    limit?: number
  }

  /**
   * Service upsert
   */
  export type ServiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Service to update in case it exists.
     */
    where: ServiceWhereUniqueInput
    /**
     * In case the Service found by the `where` argument doesn't exist, create a new Service with this data.
     */
    create: XOR<ServiceCreateInput, ServiceUncheckedCreateInput>
    /**
     * In case the Service was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceUpdateInput, ServiceUncheckedUpdateInput>
  }

  /**
   * Service delete
   */
  export type ServiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
    /**
     * Filter which Service to delete.
     */
    where: ServiceWhereUniqueInput
  }

  /**
   * Service deleteMany
   */
  export type ServiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Services to delete
     */
    where?: ServiceWhereInput
    /**
     * Limit how many Services to delete.
     */
    limit?: number
  }

  /**
   * Service.units
   */
  export type Service$unitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    where?: ServiceUnitWhereInput
    orderBy?: ServiceUnitOrderByWithRelationInput | ServiceUnitOrderByWithRelationInput[]
    cursor?: ServiceUnitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ServiceUnitScalarFieldEnum | ServiceUnitScalarFieldEnum[]
  }

  /**
   * Service without action
   */
  export type ServiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Service
     */
    select?: ServiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Service
     */
    omit?: ServiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceInclude<ExtArgs> | null
  }


  /**
   * Model ServiceUnit
   */

  export type AggregateServiceUnit = {
    _count: ServiceUnitCountAggregateOutputType | null
    _avg: ServiceUnitAvgAggregateOutputType | null
    _sum: ServiceUnitSumAggregateOutputType | null
    _min: ServiceUnitMinAggregateOutputType | null
    _max: ServiceUnitMaxAggregateOutputType | null
  }

  export type ServiceUnitAvgAggregateOutputType = {
    id: number | null
    serviceId: number | null
    arrangementId: number | null
    semitoneTranspose: number | null
    order: number | null
  }

  export type ServiceUnitSumAggregateOutputType = {
    id: number | null
    serviceId: number | null
    arrangementId: number | null
    semitoneTranspose: number | null
    order: number | null
  }

  export type ServiceUnitMinAggregateOutputType = {
    id: number | null
    serviceId: number | null
    type: $Enums.ServiceUnitType | null
    arrangementId: number | null
    semitoneTranspose: number | null
    order: number | null
  }

  export type ServiceUnitMaxAggregateOutputType = {
    id: number | null
    serviceId: number | null
    type: $Enums.ServiceUnitType | null
    arrangementId: number | null
    semitoneTranspose: number | null
    order: number | null
  }

  export type ServiceUnitCountAggregateOutputType = {
    id: number
    serviceId: number
    type: number
    arrangementId: number
    semitoneTranspose: number
    order: number
    _all: number
  }


  export type ServiceUnitAvgAggregateInputType = {
    id?: true
    serviceId?: true
    arrangementId?: true
    semitoneTranspose?: true
    order?: true
  }

  export type ServiceUnitSumAggregateInputType = {
    id?: true
    serviceId?: true
    arrangementId?: true
    semitoneTranspose?: true
    order?: true
  }

  export type ServiceUnitMinAggregateInputType = {
    id?: true
    serviceId?: true
    type?: true
    arrangementId?: true
    semitoneTranspose?: true
    order?: true
  }

  export type ServiceUnitMaxAggregateInputType = {
    id?: true
    serviceId?: true
    type?: true
    arrangementId?: true
    semitoneTranspose?: true
    order?: true
  }

  export type ServiceUnitCountAggregateInputType = {
    id?: true
    serviceId?: true
    type?: true
    arrangementId?: true
    semitoneTranspose?: true
    order?: true
    _all?: true
  }

  export type ServiceUnitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceUnit to aggregate.
     */
    where?: ServiceUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceUnits to fetch.
     */
    orderBy?: ServiceUnitOrderByWithRelationInput | ServiceUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ServiceUnits
    **/
    _count?: true | ServiceUnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ServiceUnitAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ServiceUnitSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceUnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceUnitMaxAggregateInputType
  }

  export type GetServiceUnitAggregateType<T extends ServiceUnitAggregateArgs> = {
        [P in keyof T & keyof AggregateServiceUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServiceUnit[P]>
      : GetScalarType<T[P], AggregateServiceUnit[P]>
  }




  export type ServiceUnitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceUnitWhereInput
    orderBy?: ServiceUnitOrderByWithAggregationInput | ServiceUnitOrderByWithAggregationInput[]
    by: ServiceUnitScalarFieldEnum[] | ServiceUnitScalarFieldEnum
    having?: ServiceUnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceUnitCountAggregateInputType | true
    _avg?: ServiceUnitAvgAggregateInputType
    _sum?: ServiceUnitSumAggregateInputType
    _min?: ServiceUnitMinAggregateInputType
    _max?: ServiceUnitMaxAggregateInputType
  }

  export type ServiceUnitGroupByOutputType = {
    id: number
    serviceId: number
    type: $Enums.ServiceUnitType
    arrangementId: number | null
    semitoneTranspose: number | null
    order: number
    _count: ServiceUnitCountAggregateOutputType | null
    _avg: ServiceUnitAvgAggregateOutputType | null
    _sum: ServiceUnitSumAggregateOutputType | null
    _min: ServiceUnitMinAggregateOutputType | null
    _max: ServiceUnitMaxAggregateOutputType | null
  }

  type GetServiceUnitGroupByPayload<T extends ServiceUnitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceUnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceUnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceUnitGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceUnitGroupByOutputType[P]>
        }
      >
    >


  export type ServiceUnitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    type?: boolean
    arrangementId?: boolean
    semitoneTranspose?: boolean
    order?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }, ExtArgs["result"]["serviceUnit"]>

  export type ServiceUnitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    type?: boolean
    arrangementId?: boolean
    semitoneTranspose?: boolean
    order?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }, ExtArgs["result"]["serviceUnit"]>

  export type ServiceUnitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceId?: boolean
    type?: boolean
    arrangementId?: boolean
    semitoneTranspose?: boolean
    order?: boolean
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }, ExtArgs["result"]["serviceUnit"]>

  export type ServiceUnitSelectScalar = {
    id?: boolean
    serviceId?: boolean
    type?: boolean
    arrangementId?: boolean
    semitoneTranspose?: boolean
    order?: boolean
  }

  export type ServiceUnitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "serviceId" | "type" | "arrangementId" | "semitoneTranspose" | "order", ExtArgs["result"]["serviceUnit"]>
  export type ServiceUnitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }
  export type ServiceUnitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }
  export type ServiceUnitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    service?: boolean | ServiceDefaultArgs<ExtArgs>
    arrangement?: boolean | ServiceUnit$arrangementArgs<ExtArgs>
  }

  export type $ServiceUnitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ServiceUnit"
    objects: {
      service: Prisma.$ServicePayload<ExtArgs>
      arrangement: Prisma.$SongArrangementPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      serviceId: number
      type: $Enums.ServiceUnitType
      arrangementId: number | null
      semitoneTranspose: number | null
      order: number
    }, ExtArgs["result"]["serviceUnit"]>
    composites: {}
  }

  type ServiceUnitGetPayload<S extends boolean | null | undefined | ServiceUnitDefaultArgs> = $Result.GetResult<Prisma.$ServiceUnitPayload, S>

  type ServiceUnitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceUnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceUnitCountAggregateInputType | true
    }

  export interface ServiceUnitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ServiceUnit'], meta: { name: 'ServiceUnit' } }
    /**
     * Find zero or one ServiceUnit that matches the filter.
     * @param {ServiceUnitFindUniqueArgs} args - Arguments to find a ServiceUnit
     * @example
     * // Get one ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceUnitFindUniqueArgs>(args: SelectSubset<T, ServiceUnitFindUniqueArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ServiceUnit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceUnitFindUniqueOrThrowArgs} args - Arguments to find a ServiceUnit
     * @example
     * // Get one ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceUnitFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceUnitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceUnit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitFindFirstArgs} args - Arguments to find a ServiceUnit
     * @example
     * // Get one ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceUnitFindFirstArgs>(args?: SelectSubset<T, ServiceUnitFindFirstArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceUnit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitFindFirstOrThrowArgs} args - Arguments to find a ServiceUnit
     * @example
     * // Get one ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceUnitFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceUnitFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ServiceUnits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServiceUnits
     * const serviceUnits = await prisma.serviceUnit.findMany()
     * 
     * // Get first 10 ServiceUnits
     * const serviceUnits = await prisma.serviceUnit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceUnitWithIdOnly = await prisma.serviceUnit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceUnitFindManyArgs>(args?: SelectSubset<T, ServiceUnitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ServiceUnit.
     * @param {ServiceUnitCreateArgs} args - Arguments to create a ServiceUnit.
     * @example
     * // Create one ServiceUnit
     * const ServiceUnit = await prisma.serviceUnit.create({
     *   data: {
     *     // ... data to create a ServiceUnit
     *   }
     * })
     * 
     */
    create<T extends ServiceUnitCreateArgs>(args: SelectSubset<T, ServiceUnitCreateArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ServiceUnits.
     * @param {ServiceUnitCreateManyArgs} args - Arguments to create many ServiceUnits.
     * @example
     * // Create many ServiceUnits
     * const serviceUnit = await prisma.serviceUnit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceUnitCreateManyArgs>(args?: SelectSubset<T, ServiceUnitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ServiceUnits and returns the data saved in the database.
     * @param {ServiceUnitCreateManyAndReturnArgs} args - Arguments to create many ServiceUnits.
     * @example
     * // Create many ServiceUnits
     * const serviceUnit = await prisma.serviceUnit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ServiceUnits and only return the `id`
     * const serviceUnitWithIdOnly = await prisma.serviceUnit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceUnitCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceUnitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ServiceUnit.
     * @param {ServiceUnitDeleteArgs} args - Arguments to delete one ServiceUnit.
     * @example
     * // Delete one ServiceUnit
     * const ServiceUnit = await prisma.serviceUnit.delete({
     *   where: {
     *     // ... filter to delete one ServiceUnit
     *   }
     * })
     * 
     */
    delete<T extends ServiceUnitDeleteArgs>(args: SelectSubset<T, ServiceUnitDeleteArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ServiceUnit.
     * @param {ServiceUnitUpdateArgs} args - Arguments to update one ServiceUnit.
     * @example
     * // Update one ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceUnitUpdateArgs>(args: SelectSubset<T, ServiceUnitUpdateArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ServiceUnits.
     * @param {ServiceUnitDeleteManyArgs} args - Arguments to filter ServiceUnits to delete.
     * @example
     * // Delete a few ServiceUnits
     * const { count } = await prisma.serviceUnit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceUnitDeleteManyArgs>(args?: SelectSubset<T, ServiceUnitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServiceUnits
     * const serviceUnit = await prisma.serviceUnit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceUnitUpdateManyArgs>(args: SelectSubset<T, ServiceUnitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceUnits and returns the data updated in the database.
     * @param {ServiceUnitUpdateManyAndReturnArgs} args - Arguments to update many ServiceUnits.
     * @example
     * // Update many ServiceUnits
     * const serviceUnit = await prisma.serviceUnit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ServiceUnits and only return the `id`
     * const serviceUnitWithIdOnly = await prisma.serviceUnit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ServiceUnitUpdateManyAndReturnArgs>(args: SelectSubset<T, ServiceUnitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ServiceUnit.
     * @param {ServiceUnitUpsertArgs} args - Arguments to update or create a ServiceUnit.
     * @example
     * // Update or create a ServiceUnit
     * const serviceUnit = await prisma.serviceUnit.upsert({
     *   create: {
     *     // ... data to create a ServiceUnit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServiceUnit we want to update
     *   }
     * })
     */
    upsert<T extends ServiceUnitUpsertArgs>(args: SelectSubset<T, ServiceUnitUpsertArgs<ExtArgs>>): Prisma__ServiceUnitClient<$Result.GetResult<Prisma.$ServiceUnitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ServiceUnits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitCountArgs} args - Arguments to filter ServiceUnits to count.
     * @example
     * // Count the number of ServiceUnits
     * const count = await prisma.serviceUnit.count({
     *   where: {
     *     // ... the filter for the ServiceUnits we want to count
     *   }
     * })
    **/
    count<T extends ServiceUnitCountArgs>(
      args?: Subset<T, ServiceUnitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceUnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ServiceUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServiceUnitAggregateArgs>(args: Subset<T, ServiceUnitAggregateArgs>): Prisma.PrismaPromise<GetServiceUnitAggregateType<T>>

    /**
     * Group by ServiceUnit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceUnitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServiceUnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceUnitGroupByArgs['orderBy'] }
        : { orderBy?: ServiceUnitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServiceUnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceUnitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ServiceUnit model
   */
  readonly fields: ServiceUnitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServiceUnit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceUnitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    service<T extends ServiceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ServiceDefaultArgs<ExtArgs>>): Prisma__ServiceClient<$Result.GetResult<Prisma.$ServicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    arrangement<T extends ServiceUnit$arrangementArgs<ExtArgs> = {}>(args?: Subset<T, ServiceUnit$arrangementArgs<ExtArgs>>): Prisma__SongArrangementClient<$Result.GetResult<Prisma.$SongArrangementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ServiceUnit model
   */
  interface ServiceUnitFieldRefs {
    readonly id: FieldRef<"ServiceUnit", 'Int'>
    readonly serviceId: FieldRef<"ServiceUnit", 'Int'>
    readonly type: FieldRef<"ServiceUnit", 'ServiceUnitType'>
    readonly arrangementId: FieldRef<"ServiceUnit", 'Int'>
    readonly semitoneTranspose: FieldRef<"ServiceUnit", 'Int'>
    readonly order: FieldRef<"ServiceUnit", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ServiceUnit findUnique
   */
  export type ServiceUnitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter, which ServiceUnit to fetch.
     */
    where: ServiceUnitWhereUniqueInput
  }

  /**
   * ServiceUnit findUniqueOrThrow
   */
  export type ServiceUnitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter, which ServiceUnit to fetch.
     */
    where: ServiceUnitWhereUniqueInput
  }

  /**
   * ServiceUnit findFirst
   */
  export type ServiceUnitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter, which ServiceUnit to fetch.
     */
    where?: ServiceUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceUnits to fetch.
     */
    orderBy?: ServiceUnitOrderByWithRelationInput | ServiceUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceUnits.
     */
    cursor?: ServiceUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceUnits.
     */
    distinct?: ServiceUnitScalarFieldEnum | ServiceUnitScalarFieldEnum[]
  }

  /**
   * ServiceUnit findFirstOrThrow
   */
  export type ServiceUnitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter, which ServiceUnit to fetch.
     */
    where?: ServiceUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceUnits to fetch.
     */
    orderBy?: ServiceUnitOrderByWithRelationInput | ServiceUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceUnits.
     */
    cursor?: ServiceUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceUnits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceUnits.
     */
    distinct?: ServiceUnitScalarFieldEnum | ServiceUnitScalarFieldEnum[]
  }

  /**
   * ServiceUnit findMany
   */
  export type ServiceUnitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter, which ServiceUnits to fetch.
     */
    where?: ServiceUnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceUnits to fetch.
     */
    orderBy?: ServiceUnitOrderByWithRelationInput | ServiceUnitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ServiceUnits.
     */
    cursor?: ServiceUnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceUnits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceUnits.
     */
    skip?: number
    distinct?: ServiceUnitScalarFieldEnum | ServiceUnitScalarFieldEnum[]
  }

  /**
   * ServiceUnit create
   */
  export type ServiceUnitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * The data needed to create a ServiceUnit.
     */
    data: XOR<ServiceUnitCreateInput, ServiceUnitUncheckedCreateInput>
  }

  /**
   * ServiceUnit createMany
   */
  export type ServiceUnitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ServiceUnits.
     */
    data: ServiceUnitCreateManyInput | ServiceUnitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServiceUnit createManyAndReturn
   */
  export type ServiceUnitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * The data used to create many ServiceUnits.
     */
    data: ServiceUnitCreateManyInput | ServiceUnitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ServiceUnit update
   */
  export type ServiceUnitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * The data needed to update a ServiceUnit.
     */
    data: XOR<ServiceUnitUpdateInput, ServiceUnitUncheckedUpdateInput>
    /**
     * Choose, which ServiceUnit to update.
     */
    where: ServiceUnitWhereUniqueInput
  }

  /**
   * ServiceUnit updateMany
   */
  export type ServiceUnitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ServiceUnits.
     */
    data: XOR<ServiceUnitUpdateManyMutationInput, ServiceUnitUncheckedUpdateManyInput>
    /**
     * Filter which ServiceUnits to update
     */
    where?: ServiceUnitWhereInput
    /**
     * Limit how many ServiceUnits to update.
     */
    limit?: number
  }

  /**
   * ServiceUnit updateManyAndReturn
   */
  export type ServiceUnitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * The data used to update ServiceUnits.
     */
    data: XOR<ServiceUnitUpdateManyMutationInput, ServiceUnitUncheckedUpdateManyInput>
    /**
     * Filter which ServiceUnits to update
     */
    where?: ServiceUnitWhereInput
    /**
     * Limit how many ServiceUnits to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ServiceUnit upsert
   */
  export type ServiceUnitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * The filter to search for the ServiceUnit to update in case it exists.
     */
    where: ServiceUnitWhereUniqueInput
    /**
     * In case the ServiceUnit found by the `where` argument doesn't exist, create a new ServiceUnit with this data.
     */
    create: XOR<ServiceUnitCreateInput, ServiceUnitUncheckedCreateInput>
    /**
     * In case the ServiceUnit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceUnitUpdateInput, ServiceUnitUncheckedUpdateInput>
  }

  /**
   * ServiceUnit delete
   */
  export type ServiceUnitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
    /**
     * Filter which ServiceUnit to delete.
     */
    where: ServiceUnitWhereUniqueInput
  }

  /**
   * ServiceUnit deleteMany
   */
  export type ServiceUnitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceUnits to delete
     */
    where?: ServiceUnitWhereInput
    /**
     * Limit how many ServiceUnits to delete.
     */
    limit?: number
  }

  /**
   * ServiceUnit.arrangement
   */
  export type ServiceUnit$arrangementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SongArrangement
     */
    select?: SongArrangementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SongArrangement
     */
    omit?: SongArrangementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SongArrangementInclude<ExtArgs> | null
    where?: SongArrangementWhereInput
  }

  /**
   * ServiceUnit without action
   */
  export type ServiceUnitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceUnit
     */
    select?: ServiceUnitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceUnit
     */
    omit?: ServiceUnitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServiceUnitInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SongScalarFieldEnum: {
    id: 'id',
    legacyId: 'legacyId',
    title: 'title',
    slug: 'slug',
    lyrics: 'lyrics',
    artist: 'artist',
    isDeleted: 'isDeleted'
  };

  export type SongScalarFieldEnum = (typeof SongScalarFieldEnum)[keyof typeof SongScalarFieldEnum]


  export const SongArrangementScalarFieldEnum: {
    id: 'id',
    songId: 'songId',
    key: 'key',
    name: 'name',
    isDefault: 'isDefault',
    isDeleted: 'isDeleted',
    isServiceArrangement: 'isServiceArrangement'
  };

  export type SongArrangementScalarFieldEnum = (typeof SongArrangementScalarFieldEnum)[keyof typeof SongArrangementScalarFieldEnum]


  export const SongUnitScalarFieldEnum: {
    id: 'id',
    arrangementId: 'arrangementId',
    content: 'content',
    type: 'type',
    order: 'order'
  };

  export type SongUnitScalarFieldEnum = (typeof SongUnitScalarFieldEnum)[keyof typeof SongUnitScalarFieldEnum]


  export const ServiceScalarFieldEnum: {
    id: 'id',
    legacyId: 'legacyId',
    title: 'title',
    slug: 'slug',
    worshipLeader: 'worshipLeader',
    date: 'date',
    isDeleted: 'isDeleted'
  };

  export type ServiceScalarFieldEnum = (typeof ServiceScalarFieldEnum)[keyof typeof ServiceScalarFieldEnum]


  export const ServiceUnitScalarFieldEnum: {
    id: 'id',
    serviceId: 'serviceId',
    type: 'type',
    arrangementId: 'arrangementId',
    semitoneTranspose: 'semitoneTranspose',
    order: 'order'
  };

  export type ServiceUnitScalarFieldEnum = (typeof ServiceUnitScalarFieldEnum)[keyof typeof ServiceUnitScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'SongUnitType'
   */
  export type EnumSongUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SongUnitType'>
    


  /**
   * Reference to a field of type 'SongUnitType[]'
   */
  export type ListEnumSongUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SongUnitType[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ServiceUnitType'
   */
  export type EnumServiceUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceUnitType'>
    


  /**
   * Reference to a field of type 'ServiceUnitType[]'
   */
  export type ListEnumServiceUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceUnitType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type SongWhereInput = {
    AND?: SongWhereInput | SongWhereInput[]
    OR?: SongWhereInput[]
    NOT?: SongWhereInput | SongWhereInput[]
    id?: IntFilter<"Song"> | number
    legacyId?: IntNullableFilter<"Song"> | number | null
    title?: StringFilter<"Song"> | string
    slug?: StringFilter<"Song"> | string
    lyrics?: StringFilter<"Song"> | string
    artist?: StringNullableFilter<"Song"> | string | null
    isDeleted?: BoolFilter<"Song"> | boolean
    arrangements?: SongArrangementListRelationFilter
  }

  export type SongOrderByWithRelationInput = {
    id?: SortOrder
    legacyId?: SortOrderInput | SortOrder
    title?: SortOrder
    slug?: SortOrder
    lyrics?: SortOrder
    artist?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    arrangements?: SongArrangementOrderByRelationAggregateInput
  }

  export type SongWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    legacyId?: number
    slug?: string
    AND?: SongWhereInput | SongWhereInput[]
    OR?: SongWhereInput[]
    NOT?: SongWhereInput | SongWhereInput[]
    title?: StringFilter<"Song"> | string
    lyrics?: StringFilter<"Song"> | string
    artist?: StringNullableFilter<"Song"> | string | null
    isDeleted?: BoolFilter<"Song"> | boolean
    arrangements?: SongArrangementListRelationFilter
  }, "id" | "legacyId" | "slug">

  export type SongOrderByWithAggregationInput = {
    id?: SortOrder
    legacyId?: SortOrderInput | SortOrder
    title?: SortOrder
    slug?: SortOrder
    lyrics?: SortOrder
    artist?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    _count?: SongCountOrderByAggregateInput
    _avg?: SongAvgOrderByAggregateInput
    _max?: SongMaxOrderByAggregateInput
    _min?: SongMinOrderByAggregateInput
    _sum?: SongSumOrderByAggregateInput
  }

  export type SongScalarWhereWithAggregatesInput = {
    AND?: SongScalarWhereWithAggregatesInput | SongScalarWhereWithAggregatesInput[]
    OR?: SongScalarWhereWithAggregatesInput[]
    NOT?: SongScalarWhereWithAggregatesInput | SongScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Song"> | number
    legacyId?: IntNullableWithAggregatesFilter<"Song"> | number | null
    title?: StringWithAggregatesFilter<"Song"> | string
    slug?: StringWithAggregatesFilter<"Song"> | string
    lyrics?: StringWithAggregatesFilter<"Song"> | string
    artist?: StringNullableWithAggregatesFilter<"Song"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"Song"> | boolean
  }

  export type SongArrangementWhereInput = {
    AND?: SongArrangementWhereInput | SongArrangementWhereInput[]
    OR?: SongArrangementWhereInput[]
    NOT?: SongArrangementWhereInput | SongArrangementWhereInput[]
    id?: IntFilter<"SongArrangement"> | number
    songId?: IntFilter<"SongArrangement"> | number
    key?: StringFilter<"SongArrangement"> | string
    name?: StringNullableFilter<"SongArrangement"> | string | null
    isDefault?: BoolFilter<"SongArrangement"> | boolean
    isDeleted?: BoolFilter<"SongArrangement"> | boolean
    isServiceArrangement?: BoolFilter<"SongArrangement"> | boolean
    song?: XOR<SongScalarRelationFilter, SongWhereInput>
    serviceUnit?: XOR<ServiceUnitNullableScalarRelationFilter, ServiceUnitWhereInput> | null
    units?: SongUnitListRelationFilter
  }

  export type SongArrangementOrderByWithRelationInput = {
    id?: SortOrder
    songId?: SortOrder
    key?: SortOrder
    name?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    isServiceArrangement?: SortOrder
    song?: SongOrderByWithRelationInput
    serviceUnit?: ServiceUnitOrderByWithRelationInput
    units?: SongUnitOrderByRelationAggregateInput
  }

  export type SongArrangementWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SongArrangementWhereInput | SongArrangementWhereInput[]
    OR?: SongArrangementWhereInput[]
    NOT?: SongArrangementWhereInput | SongArrangementWhereInput[]
    songId?: IntFilter<"SongArrangement"> | number
    key?: StringFilter<"SongArrangement"> | string
    name?: StringNullableFilter<"SongArrangement"> | string | null
    isDefault?: BoolFilter<"SongArrangement"> | boolean
    isDeleted?: BoolFilter<"SongArrangement"> | boolean
    isServiceArrangement?: BoolFilter<"SongArrangement"> | boolean
    song?: XOR<SongScalarRelationFilter, SongWhereInput>
    serviceUnit?: XOR<ServiceUnitNullableScalarRelationFilter, ServiceUnitWhereInput> | null
    units?: SongUnitListRelationFilter
  }, "id">

  export type SongArrangementOrderByWithAggregationInput = {
    id?: SortOrder
    songId?: SortOrder
    key?: SortOrder
    name?: SortOrderInput | SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    isServiceArrangement?: SortOrder
    _count?: SongArrangementCountOrderByAggregateInput
    _avg?: SongArrangementAvgOrderByAggregateInput
    _max?: SongArrangementMaxOrderByAggregateInput
    _min?: SongArrangementMinOrderByAggregateInput
    _sum?: SongArrangementSumOrderByAggregateInput
  }

  export type SongArrangementScalarWhereWithAggregatesInput = {
    AND?: SongArrangementScalarWhereWithAggregatesInput | SongArrangementScalarWhereWithAggregatesInput[]
    OR?: SongArrangementScalarWhereWithAggregatesInput[]
    NOT?: SongArrangementScalarWhereWithAggregatesInput | SongArrangementScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SongArrangement"> | number
    songId?: IntWithAggregatesFilter<"SongArrangement"> | number
    key?: StringWithAggregatesFilter<"SongArrangement"> | string
    name?: StringNullableWithAggregatesFilter<"SongArrangement"> | string | null
    isDefault?: BoolWithAggregatesFilter<"SongArrangement"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"SongArrangement"> | boolean
    isServiceArrangement?: BoolWithAggregatesFilter<"SongArrangement"> | boolean
  }

  export type SongUnitWhereInput = {
    AND?: SongUnitWhereInput | SongUnitWhereInput[]
    OR?: SongUnitWhereInput[]
    NOT?: SongUnitWhereInput | SongUnitWhereInput[]
    id?: IntFilter<"SongUnit"> | number
    arrangementId?: IntFilter<"SongUnit"> | number
    content?: StringFilter<"SongUnit"> | string
    type?: EnumSongUnitTypeFilter<"SongUnit"> | $Enums.SongUnitType
    order?: IntFilter<"SongUnit"> | number
    arrangement?: XOR<SongArrangementScalarRelationFilter, SongArrangementWhereInput>
  }

  export type SongUnitOrderByWithRelationInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    content?: SortOrder
    type?: SortOrder
    order?: SortOrder
    arrangement?: SongArrangementOrderByWithRelationInput
  }

  export type SongUnitWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SongUnitWhereInput | SongUnitWhereInput[]
    OR?: SongUnitWhereInput[]
    NOT?: SongUnitWhereInput | SongUnitWhereInput[]
    arrangementId?: IntFilter<"SongUnit"> | number
    content?: StringFilter<"SongUnit"> | string
    type?: EnumSongUnitTypeFilter<"SongUnit"> | $Enums.SongUnitType
    order?: IntFilter<"SongUnit"> | number
    arrangement?: XOR<SongArrangementScalarRelationFilter, SongArrangementWhereInput>
  }, "id">

  export type SongUnitOrderByWithAggregationInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    content?: SortOrder
    type?: SortOrder
    order?: SortOrder
    _count?: SongUnitCountOrderByAggregateInput
    _avg?: SongUnitAvgOrderByAggregateInput
    _max?: SongUnitMaxOrderByAggregateInput
    _min?: SongUnitMinOrderByAggregateInput
    _sum?: SongUnitSumOrderByAggregateInput
  }

  export type SongUnitScalarWhereWithAggregatesInput = {
    AND?: SongUnitScalarWhereWithAggregatesInput | SongUnitScalarWhereWithAggregatesInput[]
    OR?: SongUnitScalarWhereWithAggregatesInput[]
    NOT?: SongUnitScalarWhereWithAggregatesInput | SongUnitScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SongUnit"> | number
    arrangementId?: IntWithAggregatesFilter<"SongUnit"> | number
    content?: StringWithAggregatesFilter<"SongUnit"> | string
    type?: EnumSongUnitTypeWithAggregatesFilter<"SongUnit"> | $Enums.SongUnitType
    order?: IntWithAggregatesFilter<"SongUnit"> | number
  }

  export type ServiceWhereInput = {
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    id?: IntFilter<"Service"> | number
    legacyId?: IntNullableFilter<"Service"> | number | null
    title?: StringNullableFilter<"Service"> | string | null
    slug?: StringFilter<"Service"> | string
    worshipLeader?: StringNullableFilter<"Service"> | string | null
    date?: DateTimeFilter<"Service"> | Date | string
    isDeleted?: BoolFilter<"Service"> | boolean
    units?: ServiceUnitListRelationFilter
  }

  export type ServiceOrderByWithRelationInput = {
    id?: SortOrder
    legacyId?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    slug?: SortOrder
    worshipLeader?: SortOrderInput | SortOrder
    date?: SortOrder
    isDeleted?: SortOrder
    units?: ServiceUnitOrderByRelationAggregateInput
  }

  export type ServiceWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    legacyId?: number
    slug?: string
    AND?: ServiceWhereInput | ServiceWhereInput[]
    OR?: ServiceWhereInput[]
    NOT?: ServiceWhereInput | ServiceWhereInput[]
    title?: StringNullableFilter<"Service"> | string | null
    worshipLeader?: StringNullableFilter<"Service"> | string | null
    date?: DateTimeFilter<"Service"> | Date | string
    isDeleted?: BoolFilter<"Service"> | boolean
    units?: ServiceUnitListRelationFilter
  }, "id" | "legacyId" | "slug">

  export type ServiceOrderByWithAggregationInput = {
    id?: SortOrder
    legacyId?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    slug?: SortOrder
    worshipLeader?: SortOrderInput | SortOrder
    date?: SortOrder
    isDeleted?: SortOrder
    _count?: ServiceCountOrderByAggregateInput
    _avg?: ServiceAvgOrderByAggregateInput
    _max?: ServiceMaxOrderByAggregateInput
    _min?: ServiceMinOrderByAggregateInput
    _sum?: ServiceSumOrderByAggregateInput
  }

  export type ServiceScalarWhereWithAggregatesInput = {
    AND?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    OR?: ServiceScalarWhereWithAggregatesInput[]
    NOT?: ServiceScalarWhereWithAggregatesInput | ServiceScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Service"> | number
    legacyId?: IntNullableWithAggregatesFilter<"Service"> | number | null
    title?: StringNullableWithAggregatesFilter<"Service"> | string | null
    slug?: StringWithAggregatesFilter<"Service"> | string
    worshipLeader?: StringNullableWithAggregatesFilter<"Service"> | string | null
    date?: DateTimeWithAggregatesFilter<"Service"> | Date | string
    isDeleted?: BoolWithAggregatesFilter<"Service"> | boolean
  }

  export type ServiceUnitWhereInput = {
    AND?: ServiceUnitWhereInput | ServiceUnitWhereInput[]
    OR?: ServiceUnitWhereInput[]
    NOT?: ServiceUnitWhereInput | ServiceUnitWhereInput[]
    id?: IntFilter<"ServiceUnit"> | number
    serviceId?: IntFilter<"ServiceUnit"> | number
    type?: EnumServiceUnitTypeFilter<"ServiceUnit"> | $Enums.ServiceUnitType
    arrangementId?: IntNullableFilter<"ServiceUnit"> | number | null
    semitoneTranspose?: IntNullableFilter<"ServiceUnit"> | number | null
    order?: IntFilter<"ServiceUnit"> | number
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    arrangement?: XOR<SongArrangementNullableScalarRelationFilter, SongArrangementWhereInput> | null
  }

  export type ServiceUnitOrderByWithRelationInput = {
    id?: SortOrder
    serviceId?: SortOrder
    type?: SortOrder
    arrangementId?: SortOrderInput | SortOrder
    semitoneTranspose?: SortOrderInput | SortOrder
    order?: SortOrder
    service?: ServiceOrderByWithRelationInput
    arrangement?: SongArrangementOrderByWithRelationInput
  }

  export type ServiceUnitWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    arrangementId?: number
    AND?: ServiceUnitWhereInput | ServiceUnitWhereInput[]
    OR?: ServiceUnitWhereInput[]
    NOT?: ServiceUnitWhereInput | ServiceUnitWhereInput[]
    serviceId?: IntFilter<"ServiceUnit"> | number
    type?: EnumServiceUnitTypeFilter<"ServiceUnit"> | $Enums.ServiceUnitType
    semitoneTranspose?: IntNullableFilter<"ServiceUnit"> | number | null
    order?: IntFilter<"ServiceUnit"> | number
    service?: XOR<ServiceScalarRelationFilter, ServiceWhereInput>
    arrangement?: XOR<SongArrangementNullableScalarRelationFilter, SongArrangementWhereInput> | null
  }, "id" | "arrangementId">

  export type ServiceUnitOrderByWithAggregationInput = {
    id?: SortOrder
    serviceId?: SortOrder
    type?: SortOrder
    arrangementId?: SortOrderInput | SortOrder
    semitoneTranspose?: SortOrderInput | SortOrder
    order?: SortOrder
    _count?: ServiceUnitCountOrderByAggregateInput
    _avg?: ServiceUnitAvgOrderByAggregateInput
    _max?: ServiceUnitMaxOrderByAggregateInput
    _min?: ServiceUnitMinOrderByAggregateInput
    _sum?: ServiceUnitSumOrderByAggregateInput
  }

  export type ServiceUnitScalarWhereWithAggregatesInput = {
    AND?: ServiceUnitScalarWhereWithAggregatesInput | ServiceUnitScalarWhereWithAggregatesInput[]
    OR?: ServiceUnitScalarWhereWithAggregatesInput[]
    NOT?: ServiceUnitScalarWhereWithAggregatesInput | ServiceUnitScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ServiceUnit"> | number
    serviceId?: IntWithAggregatesFilter<"ServiceUnit"> | number
    type?: EnumServiceUnitTypeWithAggregatesFilter<"ServiceUnit"> | $Enums.ServiceUnitType
    arrangementId?: IntNullableWithAggregatesFilter<"ServiceUnit"> | number | null
    semitoneTranspose?: IntNullableWithAggregatesFilter<"ServiceUnit"> | number | null
    order?: IntWithAggregatesFilter<"ServiceUnit"> | number
  }

  export type SongCreateInput = {
    legacyId?: number | null
    title: string
    slug: string
    lyrics: string
    artist?: string | null
    isDeleted?: boolean
    arrangements?: SongArrangementCreateNestedManyWithoutSongInput
  }

  export type SongUncheckedCreateInput = {
    id?: number
    legacyId?: number | null
    title: string
    slug: string
    lyrics: string
    artist?: string | null
    isDeleted?: boolean
    arrangements?: SongArrangementUncheckedCreateNestedManyWithoutSongInput
  }

  export type SongUpdateInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    arrangements?: SongArrangementUpdateManyWithoutSongNestedInput
  }

  export type SongUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    arrangements?: SongArrangementUncheckedUpdateManyWithoutSongNestedInput
  }

  export type SongCreateManyInput = {
    id?: number
    legacyId?: number | null
    title: string
    slug: string
    lyrics: string
    artist?: string | null
    isDeleted?: boolean
  }

  export type SongUpdateManyMutationInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongArrangementCreateInput = {
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song: SongCreateNestedOneWithoutArrangementsInput
    serviceUnit?: ServiceUnitCreateNestedOneWithoutArrangementInput
    units?: SongUnitCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementUncheckedCreateInput = {
    id?: number
    songId: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    serviceUnit?: ServiceUnitUncheckedCreateNestedOneWithoutArrangementInput
    units?: SongUnitUncheckedCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    song?: SongUpdateOneRequiredWithoutArrangementsNestedInput
    serviceUnit?: ServiceUnitUpdateOneWithoutArrangementNestedInput
    units?: SongUnitUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    songId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    serviceUnit?: ServiceUnitUncheckedUpdateOneWithoutArrangementNestedInput
    units?: SongUnitUncheckedUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementCreateManyInput = {
    id?: number
    songId: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
  }

  export type SongArrangementUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongArrangementUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    songId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongUnitCreateInput = {
    content: string
    type: $Enums.SongUnitType
    order: number
    arrangement: SongArrangementCreateNestedOneWithoutUnitsInput
  }

  export type SongUnitUncheckedCreateInput = {
    id?: number
    arrangementId: number
    content: string
    type: $Enums.SongUnitType
    order: number
  }

  export type SongUnitUpdateInput = {
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
    arrangement?: SongArrangementUpdateOneRequiredWithoutUnitsNestedInput
  }

  export type SongUnitUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    arrangementId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type SongUnitCreateManyInput = {
    id?: number
    arrangementId: number
    content: string
    type: $Enums.SongUnitType
    order: number
  }

  export type SongUnitUpdateManyMutationInput = {
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type SongUnitUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    arrangementId?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ServiceCreateInput = {
    legacyId?: number | null
    title?: string | null
    slug: string
    worshipLeader?: string | null
    date: Date | string
    isDeleted?: boolean
    units?: ServiceUnitCreateNestedManyWithoutServiceInput
  }

  export type ServiceUncheckedCreateInput = {
    id?: number
    legacyId?: number | null
    title?: string | null
    slug: string
    worshipLeader?: string | null
    date: Date | string
    isDeleted?: boolean
    units?: ServiceUnitUncheckedCreateNestedManyWithoutServiceInput
  }

  export type ServiceUpdateInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    units?: ServiceUnitUpdateManyWithoutServiceNestedInput
  }

  export type ServiceUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    units?: ServiceUnitUncheckedUpdateManyWithoutServiceNestedInput
  }

  export type ServiceCreateManyInput = {
    id?: number
    legacyId?: number | null
    title?: string | null
    slug: string
    worshipLeader?: string | null
    date: Date | string
    isDeleted?: boolean
  }

  export type ServiceUpdateManyMutationInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ServiceUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ServiceUnitCreateInput = {
    type: $Enums.ServiceUnitType
    semitoneTranspose?: number | null
    order: number
    service: ServiceCreateNestedOneWithoutUnitsInput
    arrangement?: SongArrangementCreateNestedOneWithoutServiceUnitInput
  }

  export type ServiceUnitUncheckedCreateInput = {
    id?: number
    serviceId: number
    type: $Enums.ServiceUnitType
    arrangementId?: number | null
    semitoneTranspose?: number | null
    order: number
  }

  export type ServiceUnitUpdateInput = {
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    service?: ServiceUpdateOneRequiredWithoutUnitsNestedInput
    arrangement?: SongArrangementUpdateOneWithoutServiceUnitNestedInput
  }

  export type ServiceUnitUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    serviceId?: IntFieldUpdateOperationsInput | number
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    arrangementId?: NullableIntFieldUpdateOperationsInput | number | null
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ServiceUnitCreateManyInput = {
    id?: number
    serviceId: number
    type: $Enums.ServiceUnitType
    arrangementId?: number | null
    semitoneTranspose?: number | null
    order: number
  }

  export type ServiceUnitUpdateManyMutationInput = {
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ServiceUnitUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    serviceId?: IntFieldUpdateOperationsInput | number
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    arrangementId?: NullableIntFieldUpdateOperationsInput | number | null
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SongArrangementListRelationFilter = {
    every?: SongArrangementWhereInput
    some?: SongArrangementWhereInput
    none?: SongArrangementWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SongArrangementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SongCountOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    lyrics?: SortOrder
    artist?: SortOrder
    isDeleted?: SortOrder
  }

  export type SongAvgOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
  }

  export type SongMaxOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    lyrics?: SortOrder
    artist?: SortOrder
    isDeleted?: SortOrder
  }

  export type SongMinOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    lyrics?: SortOrder
    artist?: SortOrder
    isDeleted?: SortOrder
  }

  export type SongSumOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type SongScalarRelationFilter = {
    is?: SongWhereInput
    isNot?: SongWhereInput
  }

  export type ServiceUnitNullableScalarRelationFilter = {
    is?: ServiceUnitWhereInput | null
    isNot?: ServiceUnitWhereInput | null
  }

  export type SongUnitListRelationFilter = {
    every?: SongUnitWhereInput
    some?: SongUnitWhereInput
    none?: SongUnitWhereInput
  }

  export type SongUnitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SongArrangementCountOrderByAggregateInput = {
    id?: SortOrder
    songId?: SortOrder
    key?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    isServiceArrangement?: SortOrder
  }

  export type SongArrangementAvgOrderByAggregateInput = {
    id?: SortOrder
    songId?: SortOrder
  }

  export type SongArrangementMaxOrderByAggregateInput = {
    id?: SortOrder
    songId?: SortOrder
    key?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    isServiceArrangement?: SortOrder
  }

  export type SongArrangementMinOrderByAggregateInput = {
    id?: SortOrder
    songId?: SortOrder
    key?: SortOrder
    name?: SortOrder
    isDefault?: SortOrder
    isDeleted?: SortOrder
    isServiceArrangement?: SortOrder
  }

  export type SongArrangementSumOrderByAggregateInput = {
    id?: SortOrder
    songId?: SortOrder
  }

  export type EnumSongUnitTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SongUnitType | EnumSongUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSongUnitTypeFilter<$PrismaModel> | $Enums.SongUnitType
  }

  export type SongArrangementScalarRelationFilter = {
    is?: SongArrangementWhereInput
    isNot?: SongArrangementWhereInput
  }

  export type SongUnitCountOrderByAggregateInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    content?: SortOrder
    type?: SortOrder
    order?: SortOrder
  }

  export type SongUnitAvgOrderByAggregateInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    order?: SortOrder
  }

  export type SongUnitMaxOrderByAggregateInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    content?: SortOrder
    type?: SortOrder
    order?: SortOrder
  }

  export type SongUnitMinOrderByAggregateInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    content?: SortOrder
    type?: SortOrder
    order?: SortOrder
  }

  export type SongUnitSumOrderByAggregateInput = {
    id?: SortOrder
    arrangementId?: SortOrder
    order?: SortOrder
  }

  export type EnumSongUnitTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SongUnitType | EnumSongUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSongUnitTypeWithAggregatesFilter<$PrismaModel> | $Enums.SongUnitType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSongUnitTypeFilter<$PrismaModel>
    _max?: NestedEnumSongUnitTypeFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ServiceUnitListRelationFilter = {
    every?: ServiceUnitWhereInput
    some?: ServiceUnitWhereInput
    none?: ServiceUnitWhereInput
  }

  export type ServiceUnitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ServiceCountOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    worshipLeader?: SortOrder
    date?: SortOrder
    isDeleted?: SortOrder
  }

  export type ServiceAvgOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
  }

  export type ServiceMaxOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    worshipLeader?: SortOrder
    date?: SortOrder
    isDeleted?: SortOrder
  }

  export type ServiceMinOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    worshipLeader?: SortOrder
    date?: SortOrder
    isDeleted?: SortOrder
  }

  export type ServiceSumOrderByAggregateInput = {
    id?: SortOrder
    legacyId?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumServiceUnitTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceUnitType | EnumServiceUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceUnitTypeFilter<$PrismaModel> | $Enums.ServiceUnitType
  }

  export type ServiceScalarRelationFilter = {
    is?: ServiceWhereInput
    isNot?: ServiceWhereInput
  }

  export type SongArrangementNullableScalarRelationFilter = {
    is?: SongArrangementWhereInput | null
    isNot?: SongArrangementWhereInput | null
  }

  export type ServiceUnitCountOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    type?: SortOrder
    arrangementId?: SortOrder
    semitoneTranspose?: SortOrder
    order?: SortOrder
  }

  export type ServiceUnitAvgOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    arrangementId?: SortOrder
    semitoneTranspose?: SortOrder
    order?: SortOrder
  }

  export type ServiceUnitMaxOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    type?: SortOrder
    arrangementId?: SortOrder
    semitoneTranspose?: SortOrder
    order?: SortOrder
  }

  export type ServiceUnitMinOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    type?: SortOrder
    arrangementId?: SortOrder
    semitoneTranspose?: SortOrder
    order?: SortOrder
  }

  export type ServiceUnitSumOrderByAggregateInput = {
    id?: SortOrder
    serviceId?: SortOrder
    arrangementId?: SortOrder
    semitoneTranspose?: SortOrder
    order?: SortOrder
  }

  export type EnumServiceUnitTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceUnitType | EnumServiceUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceUnitTypeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceUnitType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceUnitTypeFilter<$PrismaModel>
    _max?: NestedEnumServiceUnitTypeFilter<$PrismaModel>
  }

  export type SongArrangementCreateNestedManyWithoutSongInput = {
    create?: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput> | SongArrangementCreateWithoutSongInput[] | SongArrangementUncheckedCreateWithoutSongInput[]
    connectOrCreate?: SongArrangementCreateOrConnectWithoutSongInput | SongArrangementCreateOrConnectWithoutSongInput[]
    createMany?: SongArrangementCreateManySongInputEnvelope
    connect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
  }

  export type SongArrangementUncheckedCreateNestedManyWithoutSongInput = {
    create?: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput> | SongArrangementCreateWithoutSongInput[] | SongArrangementUncheckedCreateWithoutSongInput[]
    connectOrCreate?: SongArrangementCreateOrConnectWithoutSongInput | SongArrangementCreateOrConnectWithoutSongInput[]
    createMany?: SongArrangementCreateManySongInputEnvelope
    connect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type SongArrangementUpdateManyWithoutSongNestedInput = {
    create?: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput> | SongArrangementCreateWithoutSongInput[] | SongArrangementUncheckedCreateWithoutSongInput[]
    connectOrCreate?: SongArrangementCreateOrConnectWithoutSongInput | SongArrangementCreateOrConnectWithoutSongInput[]
    upsert?: SongArrangementUpsertWithWhereUniqueWithoutSongInput | SongArrangementUpsertWithWhereUniqueWithoutSongInput[]
    createMany?: SongArrangementCreateManySongInputEnvelope
    set?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    disconnect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    delete?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    connect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    update?: SongArrangementUpdateWithWhereUniqueWithoutSongInput | SongArrangementUpdateWithWhereUniqueWithoutSongInput[]
    updateMany?: SongArrangementUpdateManyWithWhereWithoutSongInput | SongArrangementUpdateManyWithWhereWithoutSongInput[]
    deleteMany?: SongArrangementScalarWhereInput | SongArrangementScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SongArrangementUncheckedUpdateManyWithoutSongNestedInput = {
    create?: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput> | SongArrangementCreateWithoutSongInput[] | SongArrangementUncheckedCreateWithoutSongInput[]
    connectOrCreate?: SongArrangementCreateOrConnectWithoutSongInput | SongArrangementCreateOrConnectWithoutSongInput[]
    upsert?: SongArrangementUpsertWithWhereUniqueWithoutSongInput | SongArrangementUpsertWithWhereUniqueWithoutSongInput[]
    createMany?: SongArrangementCreateManySongInputEnvelope
    set?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    disconnect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    delete?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    connect?: SongArrangementWhereUniqueInput | SongArrangementWhereUniqueInput[]
    update?: SongArrangementUpdateWithWhereUniqueWithoutSongInput | SongArrangementUpdateWithWhereUniqueWithoutSongInput[]
    updateMany?: SongArrangementUpdateManyWithWhereWithoutSongInput | SongArrangementUpdateManyWithWhereWithoutSongInput[]
    deleteMany?: SongArrangementScalarWhereInput | SongArrangementScalarWhereInput[]
  }

  export type SongCreateNestedOneWithoutArrangementsInput = {
    create?: XOR<SongCreateWithoutArrangementsInput, SongUncheckedCreateWithoutArrangementsInput>
    connectOrCreate?: SongCreateOrConnectWithoutArrangementsInput
    connect?: SongWhereUniqueInput
  }

  export type ServiceUnitCreateNestedOneWithoutArrangementInput = {
    create?: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutArrangementInput
    connect?: ServiceUnitWhereUniqueInput
  }

  export type SongUnitCreateNestedManyWithoutArrangementInput = {
    create?: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput> | SongUnitCreateWithoutArrangementInput[] | SongUnitUncheckedCreateWithoutArrangementInput[]
    connectOrCreate?: SongUnitCreateOrConnectWithoutArrangementInput | SongUnitCreateOrConnectWithoutArrangementInput[]
    createMany?: SongUnitCreateManyArrangementInputEnvelope
    connect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
  }

  export type ServiceUnitUncheckedCreateNestedOneWithoutArrangementInput = {
    create?: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutArrangementInput
    connect?: ServiceUnitWhereUniqueInput
  }

  export type SongUnitUncheckedCreateNestedManyWithoutArrangementInput = {
    create?: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput> | SongUnitCreateWithoutArrangementInput[] | SongUnitUncheckedCreateWithoutArrangementInput[]
    connectOrCreate?: SongUnitCreateOrConnectWithoutArrangementInput | SongUnitCreateOrConnectWithoutArrangementInput[]
    createMany?: SongUnitCreateManyArrangementInputEnvelope
    connect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
  }

  export type SongUpdateOneRequiredWithoutArrangementsNestedInput = {
    create?: XOR<SongCreateWithoutArrangementsInput, SongUncheckedCreateWithoutArrangementsInput>
    connectOrCreate?: SongCreateOrConnectWithoutArrangementsInput
    upsert?: SongUpsertWithoutArrangementsInput
    connect?: SongWhereUniqueInput
    update?: XOR<XOR<SongUpdateToOneWithWhereWithoutArrangementsInput, SongUpdateWithoutArrangementsInput>, SongUncheckedUpdateWithoutArrangementsInput>
  }

  export type ServiceUnitUpdateOneWithoutArrangementNestedInput = {
    create?: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutArrangementInput
    upsert?: ServiceUnitUpsertWithoutArrangementInput
    disconnect?: ServiceUnitWhereInput | boolean
    delete?: ServiceUnitWhereInput | boolean
    connect?: ServiceUnitWhereUniqueInput
    update?: XOR<XOR<ServiceUnitUpdateToOneWithWhereWithoutArrangementInput, ServiceUnitUpdateWithoutArrangementInput>, ServiceUnitUncheckedUpdateWithoutArrangementInput>
  }

  export type SongUnitUpdateManyWithoutArrangementNestedInput = {
    create?: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput> | SongUnitCreateWithoutArrangementInput[] | SongUnitUncheckedCreateWithoutArrangementInput[]
    connectOrCreate?: SongUnitCreateOrConnectWithoutArrangementInput | SongUnitCreateOrConnectWithoutArrangementInput[]
    upsert?: SongUnitUpsertWithWhereUniqueWithoutArrangementInput | SongUnitUpsertWithWhereUniqueWithoutArrangementInput[]
    createMany?: SongUnitCreateManyArrangementInputEnvelope
    set?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    disconnect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    delete?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    connect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    update?: SongUnitUpdateWithWhereUniqueWithoutArrangementInput | SongUnitUpdateWithWhereUniqueWithoutArrangementInput[]
    updateMany?: SongUnitUpdateManyWithWhereWithoutArrangementInput | SongUnitUpdateManyWithWhereWithoutArrangementInput[]
    deleteMany?: SongUnitScalarWhereInput | SongUnitScalarWhereInput[]
  }

  export type ServiceUnitUncheckedUpdateOneWithoutArrangementNestedInput = {
    create?: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutArrangementInput
    upsert?: ServiceUnitUpsertWithoutArrangementInput
    disconnect?: ServiceUnitWhereInput | boolean
    delete?: ServiceUnitWhereInput | boolean
    connect?: ServiceUnitWhereUniqueInput
    update?: XOR<XOR<ServiceUnitUpdateToOneWithWhereWithoutArrangementInput, ServiceUnitUpdateWithoutArrangementInput>, ServiceUnitUncheckedUpdateWithoutArrangementInput>
  }

  export type SongUnitUncheckedUpdateManyWithoutArrangementNestedInput = {
    create?: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput> | SongUnitCreateWithoutArrangementInput[] | SongUnitUncheckedCreateWithoutArrangementInput[]
    connectOrCreate?: SongUnitCreateOrConnectWithoutArrangementInput | SongUnitCreateOrConnectWithoutArrangementInput[]
    upsert?: SongUnitUpsertWithWhereUniqueWithoutArrangementInput | SongUnitUpsertWithWhereUniqueWithoutArrangementInput[]
    createMany?: SongUnitCreateManyArrangementInputEnvelope
    set?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    disconnect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    delete?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    connect?: SongUnitWhereUniqueInput | SongUnitWhereUniqueInput[]
    update?: SongUnitUpdateWithWhereUniqueWithoutArrangementInput | SongUnitUpdateWithWhereUniqueWithoutArrangementInput[]
    updateMany?: SongUnitUpdateManyWithWhereWithoutArrangementInput | SongUnitUpdateManyWithWhereWithoutArrangementInput[]
    deleteMany?: SongUnitScalarWhereInput | SongUnitScalarWhereInput[]
  }

  export type SongArrangementCreateNestedOneWithoutUnitsInput = {
    create?: XOR<SongArrangementCreateWithoutUnitsInput, SongArrangementUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: SongArrangementCreateOrConnectWithoutUnitsInput
    connect?: SongArrangementWhereUniqueInput
  }

  export type EnumSongUnitTypeFieldUpdateOperationsInput = {
    set?: $Enums.SongUnitType
  }

  export type SongArrangementUpdateOneRequiredWithoutUnitsNestedInput = {
    create?: XOR<SongArrangementCreateWithoutUnitsInput, SongArrangementUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: SongArrangementCreateOrConnectWithoutUnitsInput
    upsert?: SongArrangementUpsertWithoutUnitsInput
    connect?: SongArrangementWhereUniqueInput
    update?: XOR<XOR<SongArrangementUpdateToOneWithWhereWithoutUnitsInput, SongArrangementUpdateWithoutUnitsInput>, SongArrangementUncheckedUpdateWithoutUnitsInput>
  }

  export type ServiceUnitCreateNestedManyWithoutServiceInput = {
    create?: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput> | ServiceUnitCreateWithoutServiceInput[] | ServiceUnitUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutServiceInput | ServiceUnitCreateOrConnectWithoutServiceInput[]
    createMany?: ServiceUnitCreateManyServiceInputEnvelope
    connect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
  }

  export type ServiceUnitUncheckedCreateNestedManyWithoutServiceInput = {
    create?: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput> | ServiceUnitCreateWithoutServiceInput[] | ServiceUnitUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutServiceInput | ServiceUnitCreateOrConnectWithoutServiceInput[]
    createMany?: ServiceUnitCreateManyServiceInputEnvelope
    connect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ServiceUnitUpdateManyWithoutServiceNestedInput = {
    create?: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput> | ServiceUnitCreateWithoutServiceInput[] | ServiceUnitUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutServiceInput | ServiceUnitCreateOrConnectWithoutServiceInput[]
    upsert?: ServiceUnitUpsertWithWhereUniqueWithoutServiceInput | ServiceUnitUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: ServiceUnitCreateManyServiceInputEnvelope
    set?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    disconnect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    delete?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    connect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    update?: ServiceUnitUpdateWithWhereUniqueWithoutServiceInput | ServiceUnitUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: ServiceUnitUpdateManyWithWhereWithoutServiceInput | ServiceUnitUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: ServiceUnitScalarWhereInput | ServiceUnitScalarWhereInput[]
  }

  export type ServiceUnitUncheckedUpdateManyWithoutServiceNestedInput = {
    create?: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput> | ServiceUnitCreateWithoutServiceInput[] | ServiceUnitUncheckedCreateWithoutServiceInput[]
    connectOrCreate?: ServiceUnitCreateOrConnectWithoutServiceInput | ServiceUnitCreateOrConnectWithoutServiceInput[]
    upsert?: ServiceUnitUpsertWithWhereUniqueWithoutServiceInput | ServiceUnitUpsertWithWhereUniqueWithoutServiceInput[]
    createMany?: ServiceUnitCreateManyServiceInputEnvelope
    set?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    disconnect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    delete?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    connect?: ServiceUnitWhereUniqueInput | ServiceUnitWhereUniqueInput[]
    update?: ServiceUnitUpdateWithWhereUniqueWithoutServiceInput | ServiceUnitUpdateWithWhereUniqueWithoutServiceInput[]
    updateMany?: ServiceUnitUpdateManyWithWhereWithoutServiceInput | ServiceUnitUpdateManyWithWhereWithoutServiceInput[]
    deleteMany?: ServiceUnitScalarWhereInput | ServiceUnitScalarWhereInput[]
  }

  export type ServiceCreateNestedOneWithoutUnitsInput = {
    create?: XOR<ServiceCreateWithoutUnitsInput, ServiceUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutUnitsInput
    connect?: ServiceWhereUniqueInput
  }

  export type SongArrangementCreateNestedOneWithoutServiceUnitInput = {
    create?: XOR<SongArrangementCreateWithoutServiceUnitInput, SongArrangementUncheckedCreateWithoutServiceUnitInput>
    connectOrCreate?: SongArrangementCreateOrConnectWithoutServiceUnitInput
    connect?: SongArrangementWhereUniqueInput
  }

  export type EnumServiceUnitTypeFieldUpdateOperationsInput = {
    set?: $Enums.ServiceUnitType
  }

  export type ServiceUpdateOneRequiredWithoutUnitsNestedInput = {
    create?: XOR<ServiceCreateWithoutUnitsInput, ServiceUncheckedCreateWithoutUnitsInput>
    connectOrCreate?: ServiceCreateOrConnectWithoutUnitsInput
    upsert?: ServiceUpsertWithoutUnitsInput
    connect?: ServiceWhereUniqueInput
    update?: XOR<XOR<ServiceUpdateToOneWithWhereWithoutUnitsInput, ServiceUpdateWithoutUnitsInput>, ServiceUncheckedUpdateWithoutUnitsInput>
  }

  export type SongArrangementUpdateOneWithoutServiceUnitNestedInput = {
    create?: XOR<SongArrangementCreateWithoutServiceUnitInput, SongArrangementUncheckedCreateWithoutServiceUnitInput>
    connectOrCreate?: SongArrangementCreateOrConnectWithoutServiceUnitInput
    upsert?: SongArrangementUpsertWithoutServiceUnitInput
    disconnect?: SongArrangementWhereInput | boolean
    delete?: SongArrangementWhereInput | boolean
    connect?: SongArrangementWhereUniqueInput
    update?: XOR<XOR<SongArrangementUpdateToOneWithWhereWithoutServiceUnitInput, SongArrangementUpdateWithoutServiceUnitInput>, SongArrangementUncheckedUpdateWithoutServiceUnitInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumSongUnitTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SongUnitType | EnumSongUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSongUnitTypeFilter<$PrismaModel> | $Enums.SongUnitType
  }

  export type NestedEnumSongUnitTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SongUnitType | EnumSongUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SongUnitType[] | ListEnumSongUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSongUnitTypeWithAggregatesFilter<$PrismaModel> | $Enums.SongUnitType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSongUnitTypeFilter<$PrismaModel>
    _max?: NestedEnumSongUnitTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumServiceUnitTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceUnitType | EnumServiceUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceUnitTypeFilter<$PrismaModel> | $Enums.ServiceUnitType
  }

  export type NestedEnumServiceUnitTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceUnitType | EnumServiceUnitTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceUnitType[] | ListEnumServiceUnitTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceUnitTypeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceUnitType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceUnitTypeFilter<$PrismaModel>
    _max?: NestedEnumServiceUnitTypeFilter<$PrismaModel>
  }

  export type SongArrangementCreateWithoutSongInput = {
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    serviceUnit?: ServiceUnitCreateNestedOneWithoutArrangementInput
    units?: SongUnitCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementUncheckedCreateWithoutSongInput = {
    id?: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    serviceUnit?: ServiceUnitUncheckedCreateNestedOneWithoutArrangementInput
    units?: SongUnitUncheckedCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementCreateOrConnectWithoutSongInput = {
    where: SongArrangementWhereUniqueInput
    create: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput>
  }

  export type SongArrangementCreateManySongInputEnvelope = {
    data: SongArrangementCreateManySongInput | SongArrangementCreateManySongInput[]
    skipDuplicates?: boolean
  }

  export type SongArrangementUpsertWithWhereUniqueWithoutSongInput = {
    where: SongArrangementWhereUniqueInput
    update: XOR<SongArrangementUpdateWithoutSongInput, SongArrangementUncheckedUpdateWithoutSongInput>
    create: XOR<SongArrangementCreateWithoutSongInput, SongArrangementUncheckedCreateWithoutSongInput>
  }

  export type SongArrangementUpdateWithWhereUniqueWithoutSongInput = {
    where: SongArrangementWhereUniqueInput
    data: XOR<SongArrangementUpdateWithoutSongInput, SongArrangementUncheckedUpdateWithoutSongInput>
  }

  export type SongArrangementUpdateManyWithWhereWithoutSongInput = {
    where: SongArrangementScalarWhereInput
    data: XOR<SongArrangementUpdateManyMutationInput, SongArrangementUncheckedUpdateManyWithoutSongInput>
  }

  export type SongArrangementScalarWhereInput = {
    AND?: SongArrangementScalarWhereInput | SongArrangementScalarWhereInput[]
    OR?: SongArrangementScalarWhereInput[]
    NOT?: SongArrangementScalarWhereInput | SongArrangementScalarWhereInput[]
    id?: IntFilter<"SongArrangement"> | number
    songId?: IntFilter<"SongArrangement"> | number
    key?: StringFilter<"SongArrangement"> | string
    name?: StringNullableFilter<"SongArrangement"> | string | null
    isDefault?: BoolFilter<"SongArrangement"> | boolean
    isDeleted?: BoolFilter<"SongArrangement"> | boolean
    isServiceArrangement?: BoolFilter<"SongArrangement"> | boolean
  }

  export type SongCreateWithoutArrangementsInput = {
    legacyId?: number | null
    title: string
    slug: string
    lyrics: string
    artist?: string | null
    isDeleted?: boolean
  }

  export type SongUncheckedCreateWithoutArrangementsInput = {
    id?: number
    legacyId?: number | null
    title: string
    slug: string
    lyrics: string
    artist?: string | null
    isDeleted?: boolean
  }

  export type SongCreateOrConnectWithoutArrangementsInput = {
    where: SongWhereUniqueInput
    create: XOR<SongCreateWithoutArrangementsInput, SongUncheckedCreateWithoutArrangementsInput>
  }

  export type ServiceUnitCreateWithoutArrangementInput = {
    type: $Enums.ServiceUnitType
    semitoneTranspose?: number | null
    order: number
    service: ServiceCreateNestedOneWithoutUnitsInput
  }

  export type ServiceUnitUncheckedCreateWithoutArrangementInput = {
    id?: number
    serviceId: number
    type: $Enums.ServiceUnitType
    semitoneTranspose?: number | null
    order: number
  }

  export type ServiceUnitCreateOrConnectWithoutArrangementInput = {
    where: ServiceUnitWhereUniqueInput
    create: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
  }

  export type SongUnitCreateWithoutArrangementInput = {
    content: string
    type: $Enums.SongUnitType
    order: number
  }

  export type SongUnitUncheckedCreateWithoutArrangementInput = {
    id?: number
    content: string
    type: $Enums.SongUnitType
    order: number
  }

  export type SongUnitCreateOrConnectWithoutArrangementInput = {
    where: SongUnitWhereUniqueInput
    create: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput>
  }

  export type SongUnitCreateManyArrangementInputEnvelope = {
    data: SongUnitCreateManyArrangementInput | SongUnitCreateManyArrangementInput[]
    skipDuplicates?: boolean
  }

  export type SongUpsertWithoutArrangementsInput = {
    update: XOR<SongUpdateWithoutArrangementsInput, SongUncheckedUpdateWithoutArrangementsInput>
    create: XOR<SongCreateWithoutArrangementsInput, SongUncheckedCreateWithoutArrangementsInput>
    where?: SongWhereInput
  }

  export type SongUpdateToOneWithWhereWithoutArrangementsInput = {
    where?: SongWhereInput
    data: XOR<SongUpdateWithoutArrangementsInput, SongUncheckedUpdateWithoutArrangementsInput>
  }

  export type SongUpdateWithoutArrangementsInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongUncheckedUpdateWithoutArrangementsInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lyrics?: StringFieldUpdateOperationsInput | string
    artist?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ServiceUnitUpsertWithoutArrangementInput = {
    update: XOR<ServiceUnitUpdateWithoutArrangementInput, ServiceUnitUncheckedUpdateWithoutArrangementInput>
    create: XOR<ServiceUnitCreateWithoutArrangementInput, ServiceUnitUncheckedCreateWithoutArrangementInput>
    where?: ServiceUnitWhereInput
  }

  export type ServiceUnitUpdateToOneWithWhereWithoutArrangementInput = {
    where?: ServiceUnitWhereInput
    data: XOR<ServiceUnitUpdateWithoutArrangementInput, ServiceUnitUncheckedUpdateWithoutArrangementInput>
  }

  export type ServiceUnitUpdateWithoutArrangementInput = {
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    service?: ServiceUpdateOneRequiredWithoutUnitsNestedInput
  }

  export type ServiceUnitUncheckedUpdateWithoutArrangementInput = {
    id?: IntFieldUpdateOperationsInput | number
    serviceId?: IntFieldUpdateOperationsInput | number
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type SongUnitUpsertWithWhereUniqueWithoutArrangementInput = {
    where: SongUnitWhereUniqueInput
    update: XOR<SongUnitUpdateWithoutArrangementInput, SongUnitUncheckedUpdateWithoutArrangementInput>
    create: XOR<SongUnitCreateWithoutArrangementInput, SongUnitUncheckedCreateWithoutArrangementInput>
  }

  export type SongUnitUpdateWithWhereUniqueWithoutArrangementInput = {
    where: SongUnitWhereUniqueInput
    data: XOR<SongUnitUpdateWithoutArrangementInput, SongUnitUncheckedUpdateWithoutArrangementInput>
  }

  export type SongUnitUpdateManyWithWhereWithoutArrangementInput = {
    where: SongUnitScalarWhereInput
    data: XOR<SongUnitUpdateManyMutationInput, SongUnitUncheckedUpdateManyWithoutArrangementInput>
  }

  export type SongUnitScalarWhereInput = {
    AND?: SongUnitScalarWhereInput | SongUnitScalarWhereInput[]
    OR?: SongUnitScalarWhereInput[]
    NOT?: SongUnitScalarWhereInput | SongUnitScalarWhereInput[]
    id?: IntFilter<"SongUnit"> | number
    arrangementId?: IntFilter<"SongUnit"> | number
    content?: StringFilter<"SongUnit"> | string
    type?: EnumSongUnitTypeFilter<"SongUnit"> | $Enums.SongUnitType
    order?: IntFilter<"SongUnit"> | number
  }

  export type SongArrangementCreateWithoutUnitsInput = {
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song: SongCreateNestedOneWithoutArrangementsInput
    serviceUnit?: ServiceUnitCreateNestedOneWithoutArrangementInput
  }

  export type SongArrangementUncheckedCreateWithoutUnitsInput = {
    id?: number
    songId: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    serviceUnit?: ServiceUnitUncheckedCreateNestedOneWithoutArrangementInput
  }

  export type SongArrangementCreateOrConnectWithoutUnitsInput = {
    where: SongArrangementWhereUniqueInput
    create: XOR<SongArrangementCreateWithoutUnitsInput, SongArrangementUncheckedCreateWithoutUnitsInput>
  }

  export type SongArrangementUpsertWithoutUnitsInput = {
    update: XOR<SongArrangementUpdateWithoutUnitsInput, SongArrangementUncheckedUpdateWithoutUnitsInput>
    create: XOR<SongArrangementCreateWithoutUnitsInput, SongArrangementUncheckedCreateWithoutUnitsInput>
    where?: SongArrangementWhereInput
  }

  export type SongArrangementUpdateToOneWithWhereWithoutUnitsInput = {
    where?: SongArrangementWhereInput
    data: XOR<SongArrangementUpdateWithoutUnitsInput, SongArrangementUncheckedUpdateWithoutUnitsInput>
  }

  export type SongArrangementUpdateWithoutUnitsInput = {
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    song?: SongUpdateOneRequiredWithoutArrangementsNestedInput
    serviceUnit?: ServiceUnitUpdateOneWithoutArrangementNestedInput
  }

  export type SongArrangementUncheckedUpdateWithoutUnitsInput = {
    id?: IntFieldUpdateOperationsInput | number
    songId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    serviceUnit?: ServiceUnitUncheckedUpdateOneWithoutArrangementNestedInput
  }

  export type ServiceUnitCreateWithoutServiceInput = {
    type: $Enums.ServiceUnitType
    semitoneTranspose?: number | null
    order: number
    arrangement?: SongArrangementCreateNestedOneWithoutServiceUnitInput
  }

  export type ServiceUnitUncheckedCreateWithoutServiceInput = {
    id?: number
    type: $Enums.ServiceUnitType
    arrangementId?: number | null
    semitoneTranspose?: number | null
    order: number
  }

  export type ServiceUnitCreateOrConnectWithoutServiceInput = {
    where: ServiceUnitWhereUniqueInput
    create: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput>
  }

  export type ServiceUnitCreateManyServiceInputEnvelope = {
    data: ServiceUnitCreateManyServiceInput | ServiceUnitCreateManyServiceInput[]
    skipDuplicates?: boolean
  }

  export type ServiceUnitUpsertWithWhereUniqueWithoutServiceInput = {
    where: ServiceUnitWhereUniqueInput
    update: XOR<ServiceUnitUpdateWithoutServiceInput, ServiceUnitUncheckedUpdateWithoutServiceInput>
    create: XOR<ServiceUnitCreateWithoutServiceInput, ServiceUnitUncheckedCreateWithoutServiceInput>
  }

  export type ServiceUnitUpdateWithWhereUniqueWithoutServiceInput = {
    where: ServiceUnitWhereUniqueInput
    data: XOR<ServiceUnitUpdateWithoutServiceInput, ServiceUnitUncheckedUpdateWithoutServiceInput>
  }

  export type ServiceUnitUpdateManyWithWhereWithoutServiceInput = {
    where: ServiceUnitScalarWhereInput
    data: XOR<ServiceUnitUpdateManyMutationInput, ServiceUnitUncheckedUpdateManyWithoutServiceInput>
  }

  export type ServiceUnitScalarWhereInput = {
    AND?: ServiceUnitScalarWhereInput | ServiceUnitScalarWhereInput[]
    OR?: ServiceUnitScalarWhereInput[]
    NOT?: ServiceUnitScalarWhereInput | ServiceUnitScalarWhereInput[]
    id?: IntFilter<"ServiceUnit"> | number
    serviceId?: IntFilter<"ServiceUnit"> | number
    type?: EnumServiceUnitTypeFilter<"ServiceUnit"> | $Enums.ServiceUnitType
    arrangementId?: IntNullableFilter<"ServiceUnit"> | number | null
    semitoneTranspose?: IntNullableFilter<"ServiceUnit"> | number | null
    order?: IntFilter<"ServiceUnit"> | number
  }

  export type ServiceCreateWithoutUnitsInput = {
    legacyId?: number | null
    title?: string | null
    slug: string
    worshipLeader?: string | null
    date: Date | string
    isDeleted?: boolean
  }

  export type ServiceUncheckedCreateWithoutUnitsInput = {
    id?: number
    legacyId?: number | null
    title?: string | null
    slug: string
    worshipLeader?: string | null
    date: Date | string
    isDeleted?: boolean
  }

  export type ServiceCreateOrConnectWithoutUnitsInput = {
    where: ServiceWhereUniqueInput
    create: XOR<ServiceCreateWithoutUnitsInput, ServiceUncheckedCreateWithoutUnitsInput>
  }

  export type SongArrangementCreateWithoutServiceUnitInput = {
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    song: SongCreateNestedOneWithoutArrangementsInput
    units?: SongUnitCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementUncheckedCreateWithoutServiceUnitInput = {
    id?: number
    songId: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
    units?: SongUnitUncheckedCreateNestedManyWithoutArrangementInput
  }

  export type SongArrangementCreateOrConnectWithoutServiceUnitInput = {
    where: SongArrangementWhereUniqueInput
    create: XOR<SongArrangementCreateWithoutServiceUnitInput, SongArrangementUncheckedCreateWithoutServiceUnitInput>
  }

  export type ServiceUpsertWithoutUnitsInput = {
    update: XOR<ServiceUpdateWithoutUnitsInput, ServiceUncheckedUpdateWithoutUnitsInput>
    create: XOR<ServiceCreateWithoutUnitsInput, ServiceUncheckedCreateWithoutUnitsInput>
    where?: ServiceWhereInput
  }

  export type ServiceUpdateToOneWithWhereWithoutUnitsInput = {
    where?: ServiceWhereInput
    data: XOR<ServiceUpdateWithoutUnitsInput, ServiceUncheckedUpdateWithoutUnitsInput>
  }

  export type ServiceUpdateWithoutUnitsInput = {
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ServiceUncheckedUpdateWithoutUnitsInput = {
    id?: IntFieldUpdateOperationsInput | number
    legacyId?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    worshipLeader?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongArrangementUpsertWithoutServiceUnitInput = {
    update: XOR<SongArrangementUpdateWithoutServiceUnitInput, SongArrangementUncheckedUpdateWithoutServiceUnitInput>
    create: XOR<SongArrangementCreateWithoutServiceUnitInput, SongArrangementUncheckedCreateWithoutServiceUnitInput>
    where?: SongArrangementWhereInput
  }

  export type SongArrangementUpdateToOneWithWhereWithoutServiceUnitInput = {
    where?: SongArrangementWhereInput
    data: XOR<SongArrangementUpdateWithoutServiceUnitInput, SongArrangementUncheckedUpdateWithoutServiceUnitInput>
  }

  export type SongArrangementUpdateWithoutServiceUnitInput = {
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    song?: SongUpdateOneRequiredWithoutArrangementsNestedInput
    units?: SongUnitUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementUncheckedUpdateWithoutServiceUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    songId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    units?: SongUnitUncheckedUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementCreateManySongInput = {
    id?: number
    key: string
    name?: string | null
    isDefault?: boolean
    isDeleted?: boolean
    isServiceArrangement?: boolean
  }

  export type SongArrangementUpdateWithoutSongInput = {
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    serviceUnit?: ServiceUnitUpdateOneWithoutArrangementNestedInput
    units?: SongUnitUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementUncheckedUpdateWithoutSongInput = {
    id?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
    serviceUnit?: ServiceUnitUncheckedUpdateOneWithoutArrangementNestedInput
    units?: SongUnitUncheckedUpdateManyWithoutArrangementNestedInput
  }

  export type SongArrangementUncheckedUpdateManyWithoutSongInput = {
    id?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    isServiceArrangement?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SongUnitCreateManyArrangementInput = {
    id?: number
    content: string
    type: $Enums.SongUnitType
    order: number
  }

  export type SongUnitUpdateWithoutArrangementInput = {
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type SongUnitUncheckedUpdateWithoutArrangementInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type SongUnitUncheckedUpdateManyWithoutArrangementInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    type?: EnumSongUnitTypeFieldUpdateOperationsInput | $Enums.SongUnitType
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ServiceUnitCreateManyServiceInput = {
    id?: number
    type: $Enums.ServiceUnitType
    arrangementId?: number | null
    semitoneTranspose?: number | null
    order: number
  }

  export type ServiceUnitUpdateWithoutServiceInput = {
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    arrangement?: SongArrangementUpdateOneWithoutServiceUnitNestedInput
  }

  export type ServiceUnitUncheckedUpdateWithoutServiceInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    arrangementId?: NullableIntFieldUpdateOperationsInput | number | null
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ServiceUnitUncheckedUpdateManyWithoutServiceInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: EnumServiceUnitTypeFieldUpdateOperationsInput | $Enums.ServiceUnitType
    arrangementId?: NullableIntFieldUpdateOperationsInput | number | null
    semitoneTranspose?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}