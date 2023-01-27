"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToString = void 0;
const streamToString = async (stream) => {
    let str = '';
    return new Promise(function (resolve, reject) {
        stream.on('data', function (data) {
            str += data.toString();
        });
        stream.on('end', function () {
            resolve(str);
        });
        stream.on('error', function (err) {
            reject(err);
        });
    });
};
exports.streamToString = streamToString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVPLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxNQUF1QixFQUFtQixFQUFFO0lBQy9FLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQTtJQUVwQixPQUFPLElBQUksT0FBTyxDQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDekMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJO1lBQzVCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDMUIsQ0FBQyxDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQixDQUFDLENBQUMsQ0FBQTtRQUNGLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRztZQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDO0FBZFcsUUFBQSxjQUFjLGtCQWN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHN0cmVhbSBmcm9tICdzdHJlYW0nO1xuXG5leHBvcnQgY29uc3Qgc3RyZWFtVG9TdHJpbmcgPSBhc3luYyAoc3RyZWFtOiBzdHJlYW0uV3JpdGFibGUpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBsZXQgc3RyOiBzdHJpbmcgPSAnJ1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSAoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc3RyZWFtLm9uKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBzdHIgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICB9KVxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmVzb2x2ZShzdHIpXG4gICAgICB9KVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgfSlcbiAgfSlcbn07XG4iXX0=