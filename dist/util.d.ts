/// <reference types="node" />
import * as stream from 'stream';
export declare const streamToString: (stream: stream.Writable) => Promise<string>;
