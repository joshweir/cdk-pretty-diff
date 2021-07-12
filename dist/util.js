"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToString = void 0;
exports.streamToString = async (stream) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVhLFFBQUEsY0FBYyxHQUFHLEtBQUssRUFBRSxNQUF1QixFQUFtQixFQUFFO0lBQy9FLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQTtJQUVwQixPQUFPLElBQUksT0FBTyxDQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDekMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJO1lBQzVCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDMUIsQ0FBQyxDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQixDQUFDLENBQUMsQ0FBQTtRQUNGLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRztZQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc3RyZWFtIGZyb20gJ3N0cmVhbSc7XG5cbmV4cG9ydCBjb25zdCBzdHJlYW1Ub1N0cmluZyA9IGFzeW5jIChzdHJlYW06IHN0cmVhbS5Xcml0YWJsZSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGxldCBzdHI6IHN0cmluZyA9ICcnXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBzdHJlYW0ub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIHN0ciArPSBkYXRhLnRvU3RyaW5nKClcbiAgICAgIH0pXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXNvbHZlKHN0cilcbiAgICAgIH0pXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICB9KVxuICB9KVxufTtcbiJdfQ==