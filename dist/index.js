"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomDiff = void 0;
const cdk_reverse_engineered_1 = require("./cdk-reverse-engineered");
const transform_1 = require("./transform");
__exportStar(require("./types"), exports);
__exportStar(require("./render"), exports);
exports.getCustomDiff = async () => {
    const cdkToolkit = await cdk_reverse_engineered_1.bootstrapCdkToolkit();
    const rawDiffs = await cdkToolkit.getDiffObject({
        stackNames: [],
    });
    const nicerDiffs = [];
    for (const rawDiff of rawDiffs) {
        nicerDiffs.push(await transform_1.transformDiff(rawDiff));
    }
    return nicerDiffs;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUNBLHFFQUErRDtBQUMvRCwyQ0FBNEM7QUFFNUMsMENBQXdCO0FBQ3hCLDJDQUF5QjtBQUVaLFFBQUEsYUFBYSxHQUFHLEtBQUssSUFBK0IsRUFBRTtJQUNqRSxNQUFNLFVBQVUsR0FBRyxNQUFNLDRDQUFtQixFQUFFLENBQUM7SUFDL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQzlDLFVBQVUsRUFBRSxFQUFFO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQXFCLEVBQUUsQ0FBQztJQUN4QyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUM5QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0seUJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmljZXJTdGFja0RpZmYgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGJvb3RzdHJhcENka1Rvb2xraXQgfSBmcm9tICcuL2Nkay1yZXZlcnNlLWVuZ2luZWVyZWQnO1xuaW1wb3J0IHsgdHJhbnNmb3JtRGlmZiB9IGZyb20gJy4vdHJhbnNmb3JtJztcblxuZXhwb3J0ICogZnJvbSAnLi90eXBlcyc7XG5leHBvcnQgKiBmcm9tICcuL3JlbmRlcic7XG5cbmV4cG9ydCBjb25zdCBnZXRDdXN0b21EaWZmID0gYXN5bmMgKCk6IFByb21pc2U8TmljZXJTdGFja0RpZmZbXT4gPT4ge1xuICBjb25zdCBjZGtUb29sa2l0ID0gYXdhaXQgYm9vdHN0cmFwQ2RrVG9vbGtpdCgpO1xuICBjb25zdCByYXdEaWZmcyA9IGF3YWl0IGNka1Rvb2xraXQuZ2V0RGlmZk9iamVjdCh7XG4gICAgc3RhY2tOYW1lczogW10sXG4gIH0pO1xuXG4gIGNvbnN0IG5pY2VyRGlmZnM6IE5pY2VyU3RhY2tEaWZmW10gPSBbXTtcbiAgZm9yIChjb25zdCByYXdEaWZmIG9mIHJhd0RpZmZzKSB7XG4gICAgbmljZXJEaWZmcy5wdXNoKGF3YWl0IHRyYW5zZm9ybURpZmYocmF3RGlmZikpO1xuICB9XG5cbiAgcmV0dXJuIG5pY2VyRGlmZnM7XG59XG4iXX0=