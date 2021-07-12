import * as stream from 'stream';

export const streamToString = async (stream: stream.Writable): Promise<string> => {
  let str: string = ''

  return new Promise (function (resolve, reject) {
      stream.on('data', function (data) {
          str += data.toString()
      })
      stream.on('end', function () {
          resolve(str)
      })
      stream.on('error', function (err) {
          reject(err)
      })
  })
};
