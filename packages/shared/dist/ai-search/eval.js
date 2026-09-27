"use strict";
/**
 * Trọ Việt - AI Natural Language Search Evaluation Suite
 * Evaluates real-world student and tenant queries in Da Nang.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_SEARCH_EVAL_CASES = void 0;
exports.runAISearchEval = runAISearchEval;
const parser_js_1 = require("./parser.js");
exports.AI_SEARCH_EVAL_CASES = [
    {
        query: 'phong tro duoi 3tr gan duy tan co may lanh',
        expectedPropertyType: 'room',
        expectedMaxRent: 3000000,
        expectedWardCode: '48_HAICHAU1',
        expectedAmenities: ['air_conditioner'],
    },
    {
        query: 'tim can ho mini my khe co ban cong thang may',
        expectedPropertyType: 'apartment',
        expectedWardCode: '48_PHUOCMY',
        expectedAmenities: ['balcony', 'elevator'],
    },
    {
        query: 'phong tro gia re gan bach khoa co gac lung wc rieng',
        expectedPropertyType: 'room',
        expectedWardCode: '48_HOAKHANHBAC',
        expectedAmenities: ['mezzanine', 'private_bathroom'],
    },
    {
        query: 'can ho duoi 5 trieu co may giat tu lanh',
        expectedPropertyType: 'apartment',
        expectedMaxRent: 5000000,
        expectedAmenities: ['washing_machine', 'refrigerator'],
    },
    {
        query: 'o ghep gan dtu gia duoi 1.5tr',
        expectedPropertyType: 'shared',
        expectedMaxRent: 1500000,
        expectedWardCode: '48_HAICHAU1',
    },
    {
        query: 'thue nha nguyen can hoa cuong',
        expectedPropertyType: 'house',
        expectedWardCode: '48_HOACUONGNAM',
    },
    {
        query: 'phong tro khep kin gio tu do duoi 2tr5',
        expectedPropertyType: 'room',
        expectedMaxRent: 2500000,
        expectedAmenities: ['private_bathroom', 'free_hours'],
    },
    {
        query: 'chmn gan bien my khe co bep rieng',
        expectedPropertyType: 'apartment',
        expectedWardCode: '48_PHUOCMY',
        expectedAmenities: ['kitchen'],
    },
    {
        query: 'phong co dieu hoa nong lanh gan dut',
        expectedPropertyType: 'room',
        expectedWardCode: '48_HOAKHANHBAC',
        expectedAmenities: ['air_conditioner', 'water_heater'],
    },
    {
        query: 'tu 2 den 4 trieu gan duy tan',
        expectedMinRent: 2000000,
        expectedMaxRent: 4000000,
        expectedWardCode: '48_HAICHAU1',
    },
    {
        query: 'phong co gac xep khong chung chu',
        expectedPropertyType: 'room',
        expectedAmenities: ['mezzanine', 'free_hours'],
    },
    {
        query: 'can ho mini 1 ngu duoi 6tr gan bien',
        expectedPropertyType: 'apartment',
        expectedMaxRent: 6000000,
        expectedWardCode: '48_PHUOCMY',
    },
    {
        query: 'phong tro hoa khanh duoi 2tr cho sinh vien',
        expectedPropertyType: 'room',
        expectedMaxRent: 2000000,
        expectedWardCode: '48_HOAKHANHBAC',
    },
    {
        query: 'phong tro hai chau co may giat wc rieng',
        expectedPropertyType: 'room',
        expectedWardCode: '48_HAICHAU1',
        expectedAmenities: ['washing_machine', 'private_bathroom'],
    },
    {
        query: 'tim nha tro co ban cong gio giac tu do',
        expectedPropertyType: 'room',
        expectedAmenities: ['balcony', 'free_hours'],
    },
];
function runAISearchEval() {
    let passed = 0;
    const failures = [];
    for (const testCase of exports.AI_SEARCH_EVAL_CASES) {
        const result = (0, parser_js_1.parseNaturalLanguageSearch)(testCase.query);
        const filter = result.parsedFilter;
        let failed = false;
        let failureReason = '';
        if (testCase.expectedPropertyType && filter.propertyType !== testCase.expectedPropertyType) {
            failed = true;
            failureReason += `Expected type ${testCase.expectedPropertyType}, got ${filter.propertyType}. `;
        }
        if (testCase.expectedMaxRent && filter.maxRent !== testCase.expectedMaxRent) {
            failed = true;
            failureReason += `Expected maxRent ${testCase.expectedMaxRent}, got ${filter.maxRent}. `;
        }
        if (testCase.expectedMinRent && filter.minRent !== testCase.expectedMinRent) {
            failed = true;
            failureReason += `Expected minRent ${testCase.expectedMinRent}, got ${filter.minRent}. `;
        }
        if (testCase.expectedWardCode && filter.wardCode !== testCase.expectedWardCode) {
            failed = true;
            failureReason += `Expected ward ${testCase.expectedWardCode}, got ${filter.wardCode}. `;
        }
        if (testCase.expectedAmenities) {
            for (const expectedAmenity of testCase.expectedAmenities) {
                if (!filter.amenityCodes || !filter.amenityCodes.includes(expectedAmenity)) {
                    failed = true;
                    failureReason += `Missing amenity ${expectedAmenity}. `;
                }
            }
        }
        if (failed) {
            failures.push({ query: testCase.query, reason: failureReason });
        }
        else {
            passed++;
        }
    }
    return {
        total: exports.AI_SEARCH_EVAL_CASES.length,
        passed,
        accuracyRate: passed / exports.AI_SEARCH_EVAL_CASES.length,
        failures,
    };
}
