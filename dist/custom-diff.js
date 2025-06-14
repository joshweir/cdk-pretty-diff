"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomDiff = void 0;
const transform_1 = require("./transform");
const raw_diff_1 = require("./raw-diff");
const getCustomDiff = async (app, props) => {
    const rawDiffs = (props === null || props === void 0 ? void 0 : props.rawDiff) || await (0, raw_diff_1.getRawDiff)(app, props === null || props === void 0 ? void 0 : props.options);
    const nicerDiffs = [];
    for (const rawDiff of rawDiffs) {
        nicerDiffs.push(await (0, transform_1.transformDiff)(rawDiff));
    }
    return nicerDiffs;
};
exports.getCustomDiff = getCustomDiff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRpZmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3VzdG9tLWRpZmYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMkNBQTRDO0FBQzVDLHlDQUF3QztBQUdqQyxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEtBQTJELEVBQTZCLEVBQUU7SUFDMUksTUFBTSxRQUFRLEdBQUcsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTyxLQUFJLE1BQU0sSUFBQSxxQkFBVSxFQUFDLEdBQUcsRUFBRSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTyxDQUFDLENBQUM7SUFDekUsTUFBTSxVQUFVLEdBQXFCLEVBQUUsQ0FBQztJQUN4QyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUM5QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBQSx5QkFBYSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDL0M7SUFFRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFSVyxRQUFBLGFBQWEsaUJBUXhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlmZk9wdGlvbnMsIE5pY2VyU3RhY2tEaWZmLCBTdGFja1Jhd0RpZmYgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IHRyYW5zZm9ybURpZmYgfSBmcm9tICcuL3RyYW5zZm9ybSc7XG5pbXBvcnQgeyBnZXRSYXdEaWZmIH0gZnJvbSAnLi9yYXctZGlmZic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmV4cG9ydCBjb25zdCBnZXRDdXN0b21EaWZmID0gYXN5bmMgKGFwcDogY2RrLkFwcCwgcHJvcHM/OiB7IHJhd0RpZmY/OiBTdGFja1Jhd0RpZmZbXTsgb3B0aW9ucz86IERpZmZPcHRpb25zIH0pOiBQcm9taXNlPE5pY2VyU3RhY2tEaWZmW10+ID0+IHtcbiAgY29uc3QgcmF3RGlmZnMgPSBwcm9wcz8ucmF3RGlmZiB8fCBhd2FpdCBnZXRSYXdEaWZmKGFwcCwgcHJvcHM/Lm9wdGlvbnMpO1xuICBjb25zdCBuaWNlckRpZmZzOiBOaWNlclN0YWNrRGlmZltdID0gW107XG4gIGZvciAoY29uc3QgcmF3RGlmZiBvZiByYXdEaWZmcykge1xuICAgIG5pY2VyRGlmZnMucHVzaChhd2FpdCB0cmFuc2Zvcm1EaWZmKHJhd0RpZmYpKTtcbiAgfVxuXG4gIHJldHVybiBuaWNlckRpZmZzO1xufTtcbiJdfQ==