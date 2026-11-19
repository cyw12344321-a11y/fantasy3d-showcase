(function(){
// Original temple stone surface measurements with bounded gap repair; source model is unchanged.
const STONE_FOUNDATION={"step":0.4,"cols":131,"rows":111,"minX":-26,"minZ":-22,"heights":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.3167,1.2828,1.3336857142857144,1.294,1.3333,1.4006,1.3115,1.3051,1.3135,1.3218,1.3302,1.3385,1.3540642857142857,1.3383,1.3379,1.3375,1.3371,1.3367,1.3363,1.3359,1.3355,1.3351,1.3347,1.3343,1.3339,1.3831785714285714,1.3818,1.3839,1.3877,1.3818,1.3728,1.3637,1.3547,1.3456,1.5208,1.52,1.5191,1.5183,1.5174,1.3466,1.3463,1.346,1.3458,1.3455,1.3453,1.345,1.3447,1.3445,1.3442,1.344,1.3437,1.3434,1.3432,1.3429,1.3427,1.3424,1.3421,1.3419,1.3416,1.3414,1.3411,1.3408,1.3406,1.3403,1.3401,1.3398,1.3395,1.3393,1.339,1.3388,1.3385,1.3382,1.338,1.3377,1.3375,1.3372,1.3369,1.3367,1.3364,1.3362,1.3359,1.3362,1.4547,1.4805,1.5062,1.532,1.5577,1.4501,1.3425,1.342,1.3415,1.3411,1.3406,1.3402,1.3398,1.3395,1.3483,1.3319,1.3233,1.3146,1.306,1.2974,1.2887,1.2801,1.2729,1.2657,1.2585,1.2513,1.2719,1.2925,1.2914,1.2902,1.2891,1.3023,1.2957,1.4056,1.3323,1.3295,1.3266,1.3237,1.3209,1.312,null,null,null,null,null,null,null,null,null,1.3336,1.3052,1.3643,1.3526,1.3427,1.4077,1.3508,1.3526,1.3589,1.3533,1.3481,1.3443,1.3995,1.3469,1.3512,1.3556,1.3504,1.3439,1.3435,1.3431,1.3427,1.3423,1.3419,1.3411,1.3419,1.4285,1.4195,1.4104,1.4014,1.3923,1.3833,1.3738,1.3597,1.3455,1.5136,1.5179,1.5174,1.5166,1.5158,1.3512,1.3506,1.3501,1.3495,1.3492,1.349,1.3487,1.3484,1.3482,1.3479,1.3477,1.3474,1.3471,1.3469,1.3466,1.3464,1.3461,1.3458,1.3456,1.3453,1.3451,1.3448,1.3446,1.3443,1.344,1.3438,1.3435,1.3433,1.343,1.3427,1.3425,1.3428,1.3431,1.3434,1.3437,1.344,1.3443,1.3446,1.3449,1.3452,1.3455,1.3458,1.3461,1.4613,1.5034,1.5415,1.5416,1.5417,1.3494,1.3502,1.3503,1.3493,1.3646,1.3672,1.3669,1.3666,1.3663,1.3813,1.3544,1.3497,1.3499,1.3513,1.3528,1.3503,1.3502,1.3502,1.3501,1.3507,1.3515,1.4544,1.3046,1.3051,1.3235,1.3436,1.3471,1.3451,1.4386,1.3497,1.3554,1.3445,1.3356,1.3267,1.3185,null,null,null,null,null,null,null,null,null,1.3506,1.3445,1.3593,1.3494,1.3426,1.4148,1.3557,1.3631,1.3742,1.3619,1.348,1.3462,1.4166,1.3534,1.3578,1.3621,1.3665,1.3708,1.3738,1.3635,1.3531,1.3492,1.3483,1.3475,1.3518,1.439,1.43,1.4209,1.4119,1.4005,1.3863,1.3722,1.358,1.3439,1.5058,1.51,1.5143,1.5149,1.5141,1.3558,1.3552,1.3546,1.3541,1.3535,1.3529,1.3524,1.3522,1.3519,1.3516,1.3514,1.3511,1.3509,1.3506,1.3503,1.3501,1.3498,1.3496,1.3493,1.3491,1.3494,1.3497,1.35,1.3503,1.3506,1.3509,1.3512,1.3515,1.3518,1.3522,1.3525,1.3528,1.3531,1.3534,1.3537,1.354,1.3543,1.3546,1.3549,1.3552,1.3555,1.3558,1.3561,1.5197,1.5044,1.5414,1.5411,1.5378,1.438422727272727,1.3505,1.3518,1.351,1.36,1.378,1.3937,1.3934,1.3931,1.4161,1.353,1.3506,1.3483,1.3491,1.3502,1.3496,1.3497,1.3496,1.35,1.3508,1.3524,1.4728,1.318,1.3214,1.3258,1.35,1.3295,1.3168,1.4717,1.3498,1.3428,1.3495,1.3414,1.3321,1.3187,null,null,null,null,null,null,null,null,null,1.3675,1.3838,1.3561,1.3493,1.3425,1.422,1.3607,1.3736,1.3873,1.3776,1.3594,1.3481,1.4336,1.36,1.3643,1.3687,1.373,1.3774,1.3817,1.3861,1.3904,1.3493,1.3625,1.3784,1.3617,1.4496,1.4405,1.4271,1.413,1.3988,1.3847,1.3705,1.3563,1.3422,1.4979,1.5021,1.5064,1.5107,1.5124,1.4332,1.4504,1.4584,1.4574,1.4563,1.4553,1.4542,1.4532,1.4521,1.4511,1.45,1.449,1.4479,1.4472,1.4466,1.4459,1.4453,1.4446,1.444,1.4433,1.4427,1.442,1.4414,1.4407,1.4391,1.4365,1.4338,1.4312,1.4285,1.4259,1.4232,1.4206,1.418,1.4153,1.4127,1.41,1.407,1.4039,1.4007,1.3976,1.3944,1.3913,1.3881,1.5521,1.6210650000000002,1.5225,1.5105,1.5413,1.4107,1.3512,1.3519,1.3533,1.3658,1.3792,1.3925,1.4092,1.4198,1.4467,1.3536,1.3514,1.3492,1.347,1.3479,1.3569,1.3532,1.3509,1.3516,1.3524,1.3532,1.4911,1.3343,1.3377,1.3411,1.346,1.3117,1.3065,1.4775,1.3602,1.3533,1.3544,1.3472,1.3366,1.3189,null,null,null,null,null,null,null,null,null,1.3485,1.3558,1.356,1.3492,1.3423,1.4277,1.357,1.3675,1.8624,1.979,1.8338,1.357,1.4507,1.4619,1.3551,1.4583,1.4586,1.459,1.4594,1.4599,1.4603,1.4607,1.4612,1.4612,1.476,1.4622,1.4509,1.4549,1.459,1.463,1.4671,1.4712,1.4752,1.4793,1.4482,1.4432,1.871,1.9901,2.0262,1.4992,1.577,1.6247,1.626,1.6274,1.6287,1.63,1.6314,1.6327,1.6341,1.6354,1.6367,1.6381,1.6398,1.639,1.6365,1.634,1.6315,1.629,1.6265,1.6278,1.6311,1.6345,1.6378,1.6411,1.6436,1.6436,1.6417,1.6416,1.6416,1.6416,1.6416,1.6416,1.634,1.6218,1.6095,1.5972,1.585,1.5727,1.5605,1.5242291666666665,1.5566,1.5248,1.9418,2.0149,1.8911,1.5975199999999998,1.4452,1.4456,1.4486,1.4517,1.4548,1.4546,1.4522,1.4497,1.4473,1.4449,1.4791,1.4601,1.4628,1.4654,1.468,1.4706,1.4732,1.4758,1.4784,1.4784,1.4781,1.4777,1.4815,1.3506,1.7885,2.068,2.002,1.208,1.3079,1.4677,1.3649,1.3615,1.3548,1.352,1.3455,1.3191,null,null,null,null,null,null,null,null,null,1.359,1.3663,1.357,1.349,1.3422,1.4329,1.7595,2.0987,1.3852,1.3162,1.3927,1.8432,1.4677,1.4605,1.4723,1.4842,1.4818,1.4795,1.4772,1.4812,1.4615,1.4616,1.4974,1.5656,1.4672,1.4709,1.4674,1.4637,1.4599,1.4551,1.4337,1.4192,1.4233,1.4273,1.3696,2.0476,1.5799944444444445,1.5887235294117643,1.593433333333333,1.3771,1.5916,1.6179,1.6193,1.6206,1.6219,1.6233,1.6246,1.626,1.6284,1.6311,1.6338,1.6366,1.6368,1.6343,1.6319,1.6294,1.6316,1.6349,1.6382,1.6398,1.6398,1.6398,1.6398,1.6398,1.6398,1.6398,1.6398,1.6398,1.6369,1.6297,1.6271,1.6271,1.6271,1.6271,1.6271,1.6271,1.6269,1.627,1.6284,1.6294,1.6871,2.0427,2.0761,2.1094,2.1428,2.1762,1.5362857142857143,1.4332,1.4367,1.4403,1.4439,1.4474,1.4488,1.4502,1.4515,1.4558,1.4586,1.4567,1.4541,1.4502,1.4454,1.4405,1.4356,1.4332,1.4329,1.4325,1.4322,1.4319,1.4315,1.8282,1.5432500000000002,1.4536,1.364,1.5559066666666665,2.0188,1.4765,1.3619,1.3612,1.3605,1.3566,1.357,1.3193,null,null,null,null,null,null,null,null,null,1.3695,1.3679,1.3585,1.3492,1.3421,1.4381,2.1627,1.6100588235294118,1.3726,1.3587,1.3446,1.3827,1.4209,1.459,1.4569,1.4545,1.4534,1.4526,1.4549,1.4584,1.5043,1.5518,1.6552,1.5751,1.4512,1.4796,1.4761,1.4726,1.4689,1.4652,1.4614,1.4577,1.454,1.4378,1.4254,1.553492857142857,1.3674,1.4427,1.6443,1.8458,2.0474,1.6112,1.6125,1.6143,1.617,1.6198,1.6225,1.6252,1.6279,1.6307,1.6334,1.6347,1.6322,1.6354,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.636,1.6288,1.6217,1.6146,1.6126,1.6126,1.6115,1.6008,1.6252,1.66,1.7029,1.4138,1.4193,1.4248,1.4304,1.4359,1.4414,1.4469,1.4483,1.4499,1.4545,1.4591,1.4637,1.4625,1.4563,1.4501,1.4711,1.4758,1.4732,1.4707,1.4681,1.4655,1.463,1.4604,1.4578,1.4553,1.4508,1.4459,1.441,1.5599,1.6789,1.7978,1.9167,2.0357,2.1546,1.4883,1.3603,1.3594,1.3586,1.3534,1.3685,1.3195,null,null,null,null,null,null,null,null,null,1.3788,1.3694,1.3601,1.3507,1.3419,1.4432,2.1612,1.6476,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4914,1.5079,1.4797,null,null,null,null,null,null,null,2.153,2.1591,2.1651,2.1712,2.1773,1.3639,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.1722,2.1763,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9999,1.6005714285714288,1.5578000000000003,1.3532,1.3544,1.3539,1.3462,1.3481,1.3197,null,null,null,null,null,null,null,null,null,1.3803,1.371,1.3616,1.3523,1.343,1.4484,1.5285599999999997,1.6852,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9642,2.1723,1.491,1.3514,1.3730478260869565,1.3518,1.3404,1.409,1.3327,null,null,null,null,null,null,null,null,null,1.3654,1.3724,1.3793,1.3863,1.3933,1.4495,1.48692,1.7227,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9284,2.0301,1.4385,1.3471,1.3636,1.3834,1.4079,1.3893,1.3771,null,null,null,null,null,null,null,null,null,1.3604,1.3673,1.3743,1.3812,1.3882,1.4522,1.4317,1.7603,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.8926,1.3884,1.3736,1.3481,1.3505,1.3519,1.3532,1.3699,1.365028571428571,null,null,null,null,null,null,null,null,null,1.3562,1.3623,1.3692,1.3762,1.3831,1.455,1.4364,1.4164,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4067,1.3812,1.3708,1.3536,1.3536,1.3515,1.3557,1.3548,1.3637,null,null,null,null,null,null,null,null,null,1.3526,1.3572,1.3642,1.3711,1.3781,1.4578,1.4416,1.4211,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.412,1.4215,1.3802,1.3576,1.3548,1.351,1.3547,1.3469,1.3551,null,null,null,null,null,null,null,null,null,1.349,1.3535,1.3591,1.3661,1.373,1.4605,1.4469,1.4258,1.3843,1.3429,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4152,1.4345,1.3956,1.3588,1.3559,1.3506,1.3535,1.3425,1.3465,null,null,null,null,null,null,null,null,null,1.3454,1.3499,1.3544,1.361,1.368,1.4633,1.4522,1.4304,1.4072357142857144,1.329,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4184,1.4361,1.4109,1.36,1.3562,1.3502,1.353,1.3381,1.338,null,null,null,null,null,null,null,null,null,1.3417,1.3463,1.3508,1.3559,1.3629,1.4658,1.4574,1.4351,1.4025666666666665,1.3152,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.422,1.4307,1.4236,1.3612,1.3565,1.35,1.3524,1.3399,1.3294,null,null,null,null,null,null,null,null,null,1.3381,1.3427,1.3472,1.3518,1.3578,1.4648,1.4627,1.4397,1.4012866666666666,1.3013,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4258,1.4252,1.4262,1.3624,1.3562,1.3498,1.3519,1.3451,1.327,null,null,null,null,null,null,null,null,null,1.3345,1.3391,1.3436,1.3481,1.3528,1.4638,1.468,1.4444,1.4100714285714282,1.2875,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4296,1.4198,1.4288,1.3635,1.3552,1.3496,1.352,1.3472,1.3292,null,null,null,null,null,null,null,null,null,1.3309,1.3355,1.34,1.3445,1.3491,1.4628,1.4733,1.4495,1.3616,1.2736,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4333,1.4177,1.4153,1.3813,1.3876,1.3651304347826085,1.3463,1.3389,1.3313,null,null,null,null,null,null,null,null,null,1.346007142857143,1.3527,1.3535,1.3542,1.3549,1.4615,1.4785,1.4548,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4317,1.4278,1.4044136363636364,1.4216,1.3753,1.3660086956521738,1.4264,1.3782,1.3405,null,null,null,null,null,null,null,null,null,1.3518,1.3525,1.3532,1.3539,1.3547,1.4624,1.476,1.46,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4291,1.4166,1.407672727272727,1.407,1.3687,1.3449,1.3446,1.3443,1.3422,null,null,null,null,null,null,null,null,null,1.3515,1.3523,1.353,1.3537,1.3544,1.4633,1.4724,1.4578,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4266,1.414,1.4081818181818184,1.3925,1.3541,1.3473,1.346,1.3457,1.3371,null,null,null,null,null,null,null,null,null,1.3506,1.352,1.3527,1.3535,1.3542,1.4643,1.4688,1.4542,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.424,1.407,1.4924,1.378,1.3672,1.3469,1.3474,1.347,1.332,null,null,null,null,null,null,null,null,null,1.3472,1.3518,1.3525,1.3532,1.354,1.4652,1.4652,1.4506,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4214,1.4078,1.4843,1.3632,1.3697,1.3495,1.3488,1.3484,1.3269,null,null,null,null,null,null,null,null,null,1.3438,1.3515,1.3523,1.353,1.3537,1.4661,1.4616,1.447,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4189,1.4086,1.4762,1.3926,1.3723,1.3521,1.3501,1.3471,1.3197,null,null,null,null,null,null,null,null,null,1.3404,1.3513,1.352,1.3528,1.3535,1.4671,1.458,1.4434,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4163,1.4093,1.4681,1.3934,1.3749,1.3547,1.3515,1.3419,1.3126,null,null,null,null,null,null,null,null,null,1.337,1.3502,1.3518,1.3525,1.3533,1.4679,1.4544,1.4398,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4153,1.41,1.4682,1.392,1.3775,1.3572,1.3529,1.3368,1.3054,null,null,null,null,null,null,null,null,null,1.3362,1.3468,1.3516,1.3523,1.353,1.4687,1.4508,1.4364,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.416,1.4085,1.4807,1.3906,1.3766,1.3598,1.3543,1.3342,1.2983,null,null,null,null,null,null,null,null,null,1.336,1.3434,1.3513,1.3521,1.3528,1.4694,1.4472,1.4342,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4146,1.4067,1.4931,1.3892,1.3752,1.3612,1.3515,1.3519,1.2976,null,null,null,null,null,null,null,null,null,1.3358,1.34,1.3511,1.3518,1.3525,1.4702,1.4436,1.432,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4151,1.4049,1.5023,1.3878,1.3738,1.3598,1.3507,1.3513,1.297,null,null,null,null,null,null,null,null,null,1.3356,1.3392,1.3498,1.3516,1.3523,1.4709,1.44,1.4297,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4156,1.4031,1.5075,1.3863,1.3724,1.3629,1.3516,1.3499,1.2964,null,null,null,null,null,null,null,null,null,1.3354,1.339,1.3464,1.3513,1.3521,1.4717,1.4364,1.4275,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4165,1.4014,1.5126,1.3849,1.3739,1.3619,1.3517,1.3495,1.2957,null,null,null,null,null,null,null,null,null,1.3352,1.3388,1.343,1.3511,1.3518,1.4724,1.4329,1.4253,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4183,1.3996,1.4033818181818183,1.3839,1.3718,1.3584,1.3511,1.3509,1.2951,null,null,null,null,null,null,null,null,null,1.335,1.3386,1.3422,1.3509,1.3516,1.4732,1.4293,1.4231,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4182,1.3978,1.3970095238095237,1.3818,1.3698,1.3529,1.3509,1.352,1.2944,null,null,null,null,null,null,null,null,null,1.3348,1.3384,1.342,1.3494,1.3514,1.4739,1.4257,1.4222,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4177,1.396,1.3917190476190475,1.3797,1.3656,1.3524,1.3508,1.3513,1.2944,null,null,null,null,null,null,null,null,null,1.3346,1.3382,1.3418,1.346,1.3511,1.4746,1.4221,1.4219,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4171,1.3932,1.3932863636363633,1.3776,1.3598,1.3532,1.3506,1.3442,1.3002,null,null,null,null,null,null,null,null,null,1.3344,1.338,1.3416,1.3452,1.3509,1.4754,1.4185,1.4215,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4166,1.3899,1.4446,1.3728,1.3543,1.3559,1.3505,1.3406,1.3061,null,null,null,null,null,null,null,null,null,1.3342,1.3378,1.3414,1.345,1.3507,1.4761,1.4149,1.4212,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4161,1.41,1.453,1.367,1.3537,1.3587,1.3504,1.3379,1.3119,null,null,null,null,null,null,null,null,null,1.334,1.3376,1.3412,1.3448,1.349,1.4746,1.4113,1.4208,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4178,1.4148,1.4614,1.3611,1.3531,1.3615,1.345995652173913,1.3352,1.3178,null,null,null,null,null,null,null,null,null,1.3338,1.3374,1.341,1.3446,1.3482,1.4722,1.409,1.4205,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4198,1.4161,1.4602,1.3556,1.3526,1.3604,1.3668,1.338,1.3157,null,null,null,null,null,null,null,null,null,1.3336,1.3372,1.3408,1.3444,1.348,1.4698,1.4082,1.4202,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9987,1.7763,1.5538,1.3899,1.4549,1.3686,1.3568,1.3527,1.3738,1.3535,1.3336,null,null,null,null,null,null,null,null,null,1.3631,1.3819,1.4096,1.4373,1.4651,1.4928,1.4182,1.3641,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0008,1.636,1.3856,1.4532933333333333,1.433,1.3824,1.3743,1.3685,1.3628,1.3571,1.3514,null,null,null,null,null,null,null,null,null,1.3406,1.3683,1.3961,1.4238,1.4515,1.4793,1.5181562499999999,1.508,1.4979,1.4878,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.003,1.652,1.3925,1.58,1.4298235294117647,1.3614,1.3605,1.3596,1.3587,1.3578,1.3559,null,null,null,null,null,null,null,null,null,1.3395,1.3548,1.3825,1.4103,1.438,1.4703,2.1085,1.487,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0051,1.6679,1.3994,1.7066,1.8143,1.3678,1.3669,1.366,1.3652,1.3627,1.3614,null,null,null,null,null,null,null,null,null,1.347,1.3413,1.369,1.3967,1.4244,1.4799,2.0522,1.466,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0072,1.6839,1.4063,1.8333,1.5891,1.3743,1.3734,1.3725,1.3704,1.3669,1.3669,null,null,null,null,null,null,null,null,null,1.354,1.3483,1.3554,1.3832,1.4109,1.4735,1.9882,1.445,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0094,1.6998,1.4132,1.96,1.4576526315789473,1.3807,1.3798,1.3781,1.3746,1.3724,1.3724,null,null,null,null,null,null,null,null,null,1.3569,1.3557,1.3496,1.3696,1.3973,1.4671,1.4081,1.424,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0115,1.7158,1.4201,1.4303,1.3607,1.3871,1.3858,1.3823,1.3788,1.3779,1.3611,null,null,null,null,null,null,null,null,null,1.3597,1.3586,1.3572,1.3561,1.3838,1.4608,1.4188,1.427,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4187,1.4257,1.4772,1.3935,1.39,1.3865,1.3834,1.3834,1.3482,null,null,null,null,null,null,null,null,null,1.3626,1.3614,1.3603,1.3585,1.3703,1.4544,1.4299,1.4365,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4221,1.4212,1.4894,1.3943,1.3942,1.3907,1.3889,1.3889,1.3353,null,null,null,null,null,null,null,null,null,1.3654,1.3643,1.3632,1.362,1.3598,1.4508,1.441,1.4465,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4255,1.4184,1.4104,1.376,1.3984,1.3949,1.3944,1.3944,1.3224,null,null,null,null,null,null,null,null,null,1.3683,1.3672,1.366,1.3649,1.3637,1.448,1.452,1.4576,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4289,1.4218,1.4224,1.3684,1.3827,1.3999,1.3999,1.4,1.3094,null,null,null,null,null,null,null,null,null,1.4141,1.3213,1.3603500000000002,1.3331,1.3439,1.453,1.4385,1.3874,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4291,1.4222,1.462,1.3763,1.3839,1.3915,1.3991,1.3894,1.379,null,null,null,null,null,null,null,null,null,1.3532,1.3554,1.3597,1.3603,1.3594,1.4399,1.5091,1.4125,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.428,1.421,1.4621,1.4348,1.4147,1.3946,1.3745,1.3701,1.3681,null,null,null,null,null,null,null,null,null,1.3524,1.3581,1.3607,1.3663,1.3657,1.4236,1.491,1.4153,2.1798,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.427,1.4197,1.4621,1.3998,1.3798,1.3631,1.3612,1.3592,1.3572,null,null,null,null,null,null,null,null,null,1.3516,1.3579,1.3605,1.3714,1.3708,1.4073,1.4729,1.4141,2.1789,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.426,1.4184,1.4622,1.3649,1.3542,1.3522,1.3503,1.3483,1.3463,null,null,null,null,null,null,null,null,null,1.3509,1.3576,1.3605,1.3745,1.3759,1.3911,1.4547,1.4364,2.178,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4249,1.4172,1.4622,1.3487,1.3451,1.3416,1.3394,1.3374,1.3354,null,null,null,null,null,null,null,null,null,1.3501,1.3574,1.3619,1.3759,1.3811,1.4001,1.4366,1.4365,2.177,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4247,1.4159,1.4623,1.3493,1.3457,1.3422,1.3386,1.3351,1.3315,null,null,null,null,null,null,null,null,null,1.3494,1.3572,1.3633,1.3773,1.3862,1.4078,1.4269,1.4366,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4251,1.4149,1.4623,1.3499,1.3463,1.3428,1.3392,1.3357,1.3321,null,null,null,null,null,null,null,null,null,1.3486,1.357,1.3647,1.3787,1.3914,1.4155,1.4272,1.4368,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4256,1.4147,1.4624,1.3545,1.3469,1.3434,1.3398,1.3363,1.3327,null,null,null,null,null,null,null,null,null,1.3478,1.3564,1.3649,1.3801,1.3941,1.4231,1.419,1.4369,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4261,1.4152,1.4624,1.3604,1.3475,1.344,1.3404,1.3369,1.3333,null,null,null,null,null,null,null,null,null,1.3471,1.3557,1.357,1.3757,1.3944,1.4113,1.4109,1.437,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4261,1.4156,1.4625,1.3663,1.3481,1.3446,1.341,1.3375,1.3339,null,null,null,null,null,null,null,null,null,1.3464,1.3551,1.3582,1.3679,1.3865,1.4137227272727273,1.4779,1.4372,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4257,1.4161,1.4625,1.3721,1.3487,1.3452,1.3416,1.3381,1.3345,null,null,null,null,null,null,null,null,null,1.3457,1.3545,1.3618,1.36,1.3787,1.415268181818182,1.4823,1.4373,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4253,1.4165,1.4625,1.378,1.3493,1.3458,1.3422,1.3387,1.3351,null,null,null,null,null,null,null,null,null,1.345,1.354,1.3654,1.3522,1.3709,1.4654,1.477,1.4374,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4249,1.417,1.4626,1.3804,1.3499,1.3464,1.3428,1.3393,1.3357,null,null,null,null,null,null,null,null,null,1.3444,1.3535,1.369,1.353,1.3615,1.4699,1.4652,1.4376,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4246,1.4175,1.4626,1.3812,1.3512,1.347,1.3434,1.3399,1.3363,null,null,null,null,null,null,null,null,null,1.3438,1.3529,1.3688,1.3566,1.3508,1.4743,1.4535,1.4377,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4242,1.4179,1.4627,1.3819,1.357,1.3476,1.344,1.3405,1.3369,null,null,null,null,null,null,null,null,null,1.3441,1.3524,1.3604,1.3602,1.3326,1.4788,1.4417,1.4378,2.1785,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4238,1.4184,1.4627,1.3827,1.3629,1.3482,1.3446,1.3411,1.3375,null,null,null,null,null,null,null,null,null,1.3486,1.3537,1.3585,1.3533,1.3246,1.4832,1.4299,1.4274,2.1751,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4234,1.4188,1.4628,1.3835,1.3688,1.3488,1.3452,1.3417,1.3381,null,null,null,null,null,null,null,null,null,1.3531,1.3566,1.3637,1.3489,1.3356,1.4877,1.4182,1.4156,2.1718,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.423,1.4193,1.4628,1.3842,1.3742,1.3493,1.3458,1.3423,1.3387,null,null,null,null,null,null,null,null,null,1.354,1.3529,1.3596,1.3445,1.3499,1.4922,1.4118,1.4118,2.1684,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4226,1.4197,1.4629,1.385,1.375,1.3499,1.3464,1.3429,1.3393,null,null,null,null,null,null,null,null,null,1.3503,1.3502,1.3574,1.3367,1.3501,1.4966,1.4186,1.4161,2.165,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4222,1.4202,1.4629,1.3858,1.3757,1.3505,1.347,1.3435,1.3399,null,null,null,null,null,null,null,null,null,1.3466,1.3507,1.3576,1.3451,1.3503,1.5011,1.4254,1.4199,2.1737,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4219,1.4207,1.463,1.3865,1.3765,1.3537,1.3476,1.3441,1.3405,null,null,null,null,null,null,null,null,null,1.3429,1.3512,1.3579,1.3453,1.3506,1.5055,1.4322,1.4109,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4215,1.4211,1.463,1.3873,1.3773,1.3595,1.3482,1.3447,1.3411,null,null,null,null,null,null,null,null,null,1.3392,1.3517,1.3583,1.3482,1.3508,1.51,1.4389,1.4076,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4211,1.4216,1.463,1.3881,1.378,1.3654,1.3488,1.3453,1.3417,null,null,null,null,null,null,null,null,null,1.3392,1.3522,1.3586,1.3525,1.351,1.5144,1.4185,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4207,1.4219,1.4631,1.3888,1.3788,1.3688,1.3494,1.3459,1.3423,null,null,null,null,null,null,null,null,null,1.3397,1.3527,1.3593,1.353,1.3532,1.5125,1.4147,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4203,1.4215,1.4631,1.3896,1.3796,1.3695,1.35,1.3465,1.3429,null,null,null,null,null,null,null,null,null,1.3397,1.3526,1.3638,1.3532,1.3539,1.5089,1.4115,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4199,1.4211,1.4632,1.3904,1.3803,1.3703,1.3506,1.347,1.3435,null,null,null,null,null,null,null,null,null,1.3393,1.3508,1.3127,1.3534,1.356,1.4644,1.4082,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4195,1.4207,1.4632,1.3911,1.3811,1.3711,1.3512,1.3476,1.3441,null,null,null,null,null,null,null,null,null,1.3389,1.3483,1.3581,1.356,1.3581,1.4659,1.4049,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4192,1.4203,1.4633,1.3919,1.3819,1.3718,1.3562,1.3482,1.3447,null,null,null,null,null,null,null,null,null,1.3368,1.3495,1.3582,1.3574,1.3603,1.4675,1.4017,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4188,1.4199,1.4633,1.3927,1.3826,1.3726,1.3621,1.3488,1.3453,null,null,null,null,null,null,null,null,null,1.34,1.3527,1.3584,1.3567,1.3624,1.469,1.3984,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4184,1.4195,1.4634,1.3934,1.3834,1.3734,1.3634,1.3494,1.3459,null,null,null,null,null,null,null,null,null,1.3431,1.3559,1.3586,1.3561,1.3642,1.4705,1.396,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.418,1.4192,1.4634,1.3942,1.3842,1.3742,1.3641,1.35,1.3465,null,null,null,null,null,null,null,null,null,1.327,1.3542,1.3587,1.3554,1.3636,1.472,1.396,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4176,1.4188,1.4633,1.395,1.3849,1.3749,1.3649,1.3506,1.3471,null,null,null,null,null,null,null,null,null,1.3529,1.3526,1.3585,1.3548,1.363,1.4736,1.396,1.4057,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4172,1.4184,1.4726782608695657,1.3957,1.3857,1.3757,1.3657,1.3512,1.3477,null,null,null,null,null,null,null,null,null,1.3513,1.3471,1.3517,1.3542,1.3669,1.4751,1.4960874999999998,2.0338,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.0549,1.3933,1.4133,1.3965,1.3865,1.3765,1.3664,1.3528,1.3483,null,null,null,null,null,null,null,null,null,1.3485,1.3431,1.3489,1.3535,1.3759,1.4766,2.1101,2.0148,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9397,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.9644,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2.1015,1.8472,1.5928,1.3385,1.7416,2.1448,1.5222,1.3973,1.3872,1.3772,1.3672,1.3572,1.348,null,null,null,null,null,null,null,null,null,1.3443,1.3476,1.3522,1.3469,1.343,1.4804,1.8457,1.9958,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.3419,1.3437,null,null,null,null,null,null,null,null,null,null,null,null,2.0091,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4561,1.7207,1.9853,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.3529,1.7188,2.0846,1.9076,1.7306,1.5535,1.7052,1.857,1.5000588235294117,1.398,1.388,1.378,1.368,1.3579,1.3466,null,null,null,null,null,null,null,null,null,1.3402,1.3522,1.3554,1.3541,1.3412,1.4772,1.5813214285714288,1.9768,2.0106,2.0444,2.0782,2.112,2.1458,2.1796,null,null,null,null,null,null,null,null,null,null,null,null,1.4089,1.5145071428571433,2.1782,2.1738,2.1694,2.165,2.1606,2.1562,2.1542,1.7771,1.4001,1.4233,1.4137,1.7479333333333333,2.0785,1.6748,1.6666,1.6583,1.6693,1.6803,1.6913,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.6618,1.669,1.6763,1.6835,1.6937,1.7008,1.145,1.249,1.3529,1.5162,1.6796,1.8429,2.0063,2.1696,2.1718,2.1753,2.1788,2.1395,2.1001,2.0608,2.0215,1.9821,1.9428,1.8384,1.8951,1.9517,2.0084,2.0651,2.1217,2.1784,2.1753,2.1722,2.169,2.1659,2.1674,2.0677,1.968,1.8683,1.7686,1.6689,1.569178571428571,1.5342,1.3988,1.3888,1.3788,1.3687,1.3587,1.3452,null,null,null,null,null,null,null,null,null,1.3401,1.3567,1.3581,1.3586,1.3571,1.4402,1.9178,1.9578,1.9979,2.0379,2.078,2.118,1.5662214285714284,1.4844,1.4847,1.4851,1.4734,1.4609,1.4445,1.4777,1.4791,1.4727,1.4614,1.449,1.4463,1.4161,1.476,1.4512,1.4299,1.4219,1.4261,1.4304,1.4346,1.4388,1.4686,2.1362,1.4046,1.4081,1.3414,2.1346,1.8679,1.6063,1.6171,1.6292,1.6464,1.6614,1.6649,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.6541,1.6561,1.6633,1.6622,1.6374,1.609,1.6442,2.0797,1.6645714285714284,1.6652,1.6658,1.6664714285714286,1.6859,1.436,1.4421,1.4493,1.4577,1.457,1.4568,1.4586,1.4603,1.4621,1.4638,1.4646,1.4654,1.4662,1.467,1.4676,1.4678,1.468,1.4682,1.4684,1.4686,1.4688,1.469,1.4761,1.4831,1.4902,1.4973,1.5043,1.5113866666666664,1.5081,1.3996,1.3895,1.3795,1.3695,1.3595,1.3438,null,null,null,null,null,null,null,null,null,1.3446,1.3613,1.3612,1.3631,1.3658,1.4032,1.486478947368421,1.9165,2.1335,2.1064,2.0312,1.354,1.4492,1.4414,1.401,1.4582650000000001,1.394,1.4327,1.4199,1.4109,1.4159,1.4208,1.4258,1.4484,1.4341,1.268,1.3934,1.4367,1.4353,1.437,1.4387,1.4362,1.43,1.4047,1.4086,1.3844,1.5897809523809523,2.1573,2.0562,1.9537,1.5576,1.6059,1.6206,1.6378,1.655,1.6629,1.6612,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.6522,1.6532,1.6576,1.6549,1.6522,1.6495,1.6044,1.4841,2.1,2.1704,2.1249,1.8204,1.379,1.3967,1.5818739130434782,1.4264,1.4372,1.4399,1.4422,1.444,1.4458,1.4476,1.449,1.4498,1.4506,1.4514,1.4522,1.453,1.4538,1.4547,1.4555,1.4563,1.4568,1.457,1.4572,1.5214133333333335,1.7338,1.9463,2.1587,1.9575,1.3284,1.4821,1.4003,1.3903,1.3803,1.3703,1.3602,1.3424,null,null,null,null,null,null,null,null,null,1.3255,1.3553833333333332,1.4052,1.4403,1.4513,1.4438,1.3771,1.4243,1.3771,1.3732,1.3758,1.3712,1.469,1.4105,1.3571,1.3332,1.4298,1.4278,1.4323,1.4368,1.4413,1.4449,1.4419,1.4389,1.4386,1.4784,1.4831,1.4822,1.4791,1.4759,1.4728,1.4717,1.4714,1.4711,1.4788857142857144,1.4043,1.585404761904762,1.5329,1.5306,1.4932,1.65473125,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.6355066666666664,1.5141,1.5306,1.5491,1.5485,1.5531,1.5252,1.5157,1.5134,1.5111,1.5088,1.4958,1.481,1.4662,1.4514,1.4627,1.4268,1.4328,1.4389,1.4449,1.4509,1.4553,1.457,1.4587,1.4604,1.4622,1.4639,1.4656,1.4673,1.3629,1.4428823529411763,1.4052,1.3791,1.4029,1.4414,1.4682,1.4135,1.406,1.3986,1.3926,1.3887,1.3849,null,null,null,null,null,null,null,null,null,1.3064,1.3531,1.3468,1.3341,1.3358,1.4358,1.348,1.3476,1.3498,1.3555,1.3612,1.3669,1.414,1.4097,1.3874,1.3891,1.3909,1.3926,1.3944,1.392,1.3897,1.3779,1.3629,1.3479,1.4091,1.3909,1.272,1.3448,1.3481,1.351,1.3539,1.3603,1.3667,1.3539,1.4971,1.5724,1.5744,1.5704,1.5466,1.4882,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4501,1.5613,1.5586,1.5559,1.5532,1.5518,1.4045,1.3506,1.3475,1.3487,1.351,1.3514,1.376,1.3612,1.3791,1.3944,1.3917,1.3872,1.3827,1.3783,1.3738,1.3693,1.3649,1.3604,1.3559,1.3515,1.347,1.4299,1.4099,1.3844,1.3637,1.3664,1.3565,1.3588,1.4382,1.3921,1.387,1.3819,1.3767,1.3716,1.3665,null,null,null,null,null,null,null,null,null,1.3253,1.3465,1.3477,1.3478,1.3438,1.4277,1.3478,1.3475,1.3471,1.3467,1.3463,1.348,1.4142,1.3871,1.3866,1.3843,1.382,1.3796,1.3773,1.375,1.3726,1.3703,1.3636,1.3486,1.3952,1.402,1.3565,1.3464,1.3497,1.3481,1.3477,1.3491,1.3469,1.3544,1.4703090909090906,1.5744,1.5591,1.5872,1.5787,1.4771,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4547,1.5613,1.5586,1.5559,1.5545,1.5544,1.3356,1.3403,1.3482,1.3486,1.3491,1.3495,1.35,1.3496,1.3618,1.3895,1.3869,1.3842,1.3813,1.3769,1.3724,1.3679,1.3635,1.359,1.3545,1.3501,1.3456,1.4382,1.3907,1.349,1.3479,1.3495,1.3616,1.3606,1.4288,1.3857,1.3799,1.3755,1.3704,1.3653,1.3602,null,null,null,null,null,null,null,null,null,1.3423,1.3564,1.357,1.3558,1.3518,1.4012,1.3476,1.3473,1.3469,1.3465,1.3465,1.343,1.4064,1.3746,1.3675,1.3531,1.3474,1.3469,1.3474,1.3478,1.3482,1.3486,1.349,1.3497,1.3656541666666666,1.4089,1.3552,1.3497,1.35,1.3553,1.3652,1.3674,1.3583,1.3486,1.5652,1.5759,1.5677,1.552,1.5847,1.466,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4593,1.5613,1.5586,1.5573,1.5572,1.5571,1.351,1.3568,1.3506,1.3455,1.3446,1.3438,1.343,1.3421,1.3409,1.3846,1.382,1.3793,1.3767,1.374,1.371,1.3666,1.3621,1.3576,1.3532,1.3487,1.3442,1.4464,1.3895,1.3481,1.3441,1.3387,1.3689,1.3581,1.4194,1.3729,1.3732,1.3671,1.363,1.3589,1.3538,null,null,null,null,null,null,null,null,null,1.3492,1.3541,1.3557,1.3586,1.3578,1.391,1.3474,1.3471,1.3467,1.3469,1.3464,1.3407,1.3986,1.361,1.3555,1.3503,1.3498,1.3478,1.3491,1.3499,1.3494,1.3497,1.3501,1.3581,1.4076,1.4158,1.3505,1.3509,1.3517,1.3516,1.3458,1.3426,1.3395,1.3459,1.5687,1.5674,1.5635,1.5593,1.5349,1.4549,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.4639,1.5612,1.56,1.5599,1.5598,1.5598,1.3569,1.3583,1.3519,1.3452,1.3386,1.3359,1.3351,1.3342,1.3486,1.3797,1.3771,1.3744,1.3718,1.3691,1.3665,1.3638,1.3607,1.3562,1.3518,1.3473,1.3428,1.4478,1.3821,1.3475,1.3454,1.367,1.3664,1.3556,1.4147,1.3569,1.3686,1.3608,1.3543,1.3502,1.3461,null,null,null,null,null,null,null,null,null,1.3527,1.3569,1.3631,1.3617,1.3646,1.3814,1.3473,1.3469,1.3468,1.3458,1.3448,1.3438,1.3908,1.3474,1.342,1.3466,1.3485,1.3468,1.3469,1.3467,1.3472,1.3479,1.3485,1.3504,1.4064,1.3268,1.35,1.349,1.3499,1.344,1.3335,1.3303,1.3379,1.3464,1.5721,1.5628,1.5593,1.5558,1.5446,0.9053,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.8674,1.5585,1.5627,1.5626,1.5625,1.5624,1.3627,1.3598,1.3532,1.3465,1.3399,1.3333,1.3272,1.3263,1.3348,1.3749,1.3722,1.3696,1.3669,1.3643,1.3616,1.359,1.3563,1.3537,1.3504,1.3459,1.3415,1.4377,1.3497,1.3469,1.3467,1.3471,1.3639,1.3531,1.4163,1.3408,1.3525,1.3573,1.3484,1.3414,1.3373,null,null,null,null,null,null,null,null,null,1.3564,1.3658,1.3649,1.3491,1.3677,1.358142857142857,1.3471,1.3463,1.3453,1.3443,1.3433,1.3423,1.3515,1.3338,1.3377,1.3342,1.3077,1.3016,1.3095,1.3173,1.3251,1.3329,1.3407,1.3469,1.3513,1.3071,1.3531,1.3393,1.3335,1.3277,1.3215,1.33,1.3385,1.3394,1.5637,1.5586,1.5551,1.5516,1.5481,0.8704,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1.5321,1.5433,1.5545,1.5652,1.5651,1.3677,1.3611,1.3545,1.3478,1.3412,1.3345,1.3279,1.3213,1.3176,1.37,1.3673,1.3647,1.362,1.3594,1.3567,1.3541,1.3514,1.3488,1.3461,1.3435,1.3401,1.4276,1.3386,1.3468,1.3481,1.3346,1.3428,1.3503,1.418,1.3248,1.3365,1.3482,1.3448,1.3359,1.3286,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.8135,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"uv":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.52849,0.49808],[0.52691,0.49826],[0.52691,0.49826],[0.24754,0.73445],[0.24755,0.73595],[0.24756,0.73756],[0.24746,0.73946],[0.86734,0.59841],[0.86734,0.59679],[0.86735,0.59518],[0.86735,0.59357],[0.86736,0.59196],[0.86736,0.59196],[0.75363,0.43585],[0.75363,0.43428],[0.75363,0.4327],[0.75363,0.43112],[0.75363,0.42955],[0.75363,0.42797],[0.75363,0.42639],[0.75363,0.42482],[0.75363,0.42324],[0.75363,0.42166],[0.75363,0.42009],[0.75363,0.41851],[0.75363,0.41851],[0.14408,0.90193],[0.14419,0.90077],[0.14429,0.89962],[0.1444,0.89845],[0.14451,0.89729],[0.14462,0.89612],[0.14473,0.89495],[0.14484,0.89379],[0.14495,0.8923],[0.14503,0.89109],[0.14511,0.88989],[0.14519,0.88869],[0.14528,0.88748],[0.00302,0.70358],[0.00456,0.70358],[0.00611,0.70358],[0.00766,0.70358],[0.00921,0.70358],[0.01075,0.70358],[0.0123,0.70358],[0.01385,0.70358],[0.0154,0.70358],[0.01694,0.70358],[0.01849,0.70358],[0.02004,0.70358],[0.02159,0.70358],[0.02313,0.70358],[0.02468,0.70358],[0.02623,0.70358],[0.02778,0.70357],[0.02932,0.70357],[0.03087,0.70357],[0.03242,0.70357],[0.03397,0.70357],[0.03551,0.70357],[0.03706,0.70357],[0.03861,0.70357],[0.04016,0.70357],[0.04171,0.70357],[0.04325,0.70357],[0.0448,0.70357],[0.04635,0.70357],[0.0479,0.70357],[0.04944,0.70357],[0.05099,0.70357],[0.05254,0.70357],[0.05409,0.70357],[0.05563,0.70357],[0.05718,0.70357],[0.05873,0.70357],[0.06028,0.70357],[0.06182,0.70357],[0.06337,0.70356],[0.06492,0.70356],[0.06647,0.70356],[0.06801,0.70356],[0.22366,0.97758],[0.225,0.97842],[0.22634,0.97926],[0.22767,0.9801],[0.22901,0.98094],[0.22901,0.98094],[0.54039,0.8445],[0.54041,0.846],[0.54044,0.8475],[0.54047,0.849],[0.54049,0.85051],[0.54052,0.85201],[0.54054,0.85352],[0.54057,0.85503],[0.06568,0.22738],[0.6749,0.38488],[0.6749,0.38488],[0.6749,0.38488],[0.6749,0.38488],[0.6749,0.38488],[0.6749,0.38488],[0.67418,0.39412],[0.67407,0.39566],[0.67395,0.3972],[0.67384,0.39874],[0.67372,0.40028],[0.67372,0.40028],[0.54051,0.87732],[0.54051,0.87732],[0.54051,0.87732],[0.61362,0.11628],[0.612,0.11649],[0.61037,0.11674],[0.14295,0.55143],[0.14281,0.55312],[0.14281,0.55312],[0.14281,0.55312],[0.14281,0.55312],[0.80971,0.60724],[0.8114,0.6073],null,null,null,null,null,null,null,null,null,[0.52842,0.49644],[0.52684,0.49662],[0.24597,0.733],[0.246,0.73449],[0.24602,0.73598],[0.24606,0.73759],[0.24583,0.73955],[0.24617,0.74087],[0.24622,0.74237],[0.2463,0.74386],[0.24636,0.74536],[0.24646,0.74684],[0.24653,0.74838],[0.75205,0.43584],[0.75206,0.43427],[0.75207,0.4327],[0.75206,0.43112],[0.75204,0.42953],[0.75204,0.42796],[0.75204,0.42638],[0.75204,0.4248],[0.75204,0.42323],[0.75204,0.42165],[0.75204,0.42007],[0.75203,0.4185],[0.14279,0.90305],[0.1429,0.90189],[0.14301,0.90072],[0.14312,0.89955],[0.14323,0.89839],[0.14334,0.89722],[0.14345,0.89606],[0.14356,0.8949],[0.14367,0.89375],[0.14375,0.89228],[0.14378,0.89105],[0.14386,0.88984],[0.14394,0.88864],[0.14402,0.88744],[0.00304,0.70526],[0.00458,0.70526],[0.00612,0.70525],[0.00766,0.70524],[0.00921,0.70524],[0.01076,0.70524],[0.01231,0.70524],[0.01385,0.70524],[0.0154,0.70524],[0.01695,0.70524],[0.0185,0.70524],[0.02004,0.70524],[0.02159,0.70524],[0.02314,0.70524],[0.02469,0.70524],[0.02623,0.70524],[0.02778,0.70524],[0.02933,0.70524],[0.03088,0.70524],[0.03242,0.70524],[0.03397,0.70524],[0.03552,0.70524],[0.03707,0.70524],[0.03862,0.70524],[0.04016,0.70524],[0.04171,0.70523],[0.04326,0.70523],[0.04481,0.70523],[0.04635,0.70523],[0.0479,0.70523],[0.04945,0.70523],[0.05099,0.70523],[0.05254,0.70523],[0.05408,0.70523],[0.05563,0.70524],[0.05717,0.70524],[0.05872,0.70524],[0.06026,0.70524],[0.06181,0.70524],[0.06335,0.70524],[0.06489,0.70524],[0.06644,0.70524],[0.06798,0.70524],[0.22288,0.97898],[0.22425,0.97984],[0.22561,0.98069],[0.54193,0.83968],[0.22823,0.98221],[0.7807,0.68228],[0.782,0.68161],[0.78337,0.68092],[0.542,0.84747],[0.54201,0.84899],[0.54203,0.8505],[0.54205,0.852],[0.54208,0.85351],[0.5421,0.85502],[0.06577,0.22892],[0.06421,0.22888],[0.06266,0.22889],[0.0611,0.22889],[0.05955,0.22891],[0.058,0.22895],[0.57534,0.60397],[0.57528,0.60562],[0.57522,0.60726],[0.57516,0.60891],[0.05026,0.22894],[0.04874,0.22895],[0.54214,0.87554],[0.54211,0.87728],[0.54211,0.87878],[0.5422,0.88028],[0.5423,0.88177],[0.14177,0.5479],[0.14164,0.54949],[0.1414,0.55132],[0.14125,0.55305],[0.80508,0.60557],[0.80641,0.60556],[0.8081,0.60562],[0.80979,0.60568],[0.8114,0.6057],null,null,null,null,null,null,null,null,null,[0.52836,0.49481],[0.52675,0.49495],[0.24445,0.73302],[0.24447,0.73451],[0.2445,0.73602],[0.24456,0.73761],[0.24447,0.73951],[0.24466,0.74093],[0.2447,0.74245],[0.24487,0.7439],[0.24507,0.74535],[0.24522,0.74682],[0.24504,0.74849],[0.75046,0.43583],[0.75047,0.43426],[0.75049,0.43269],[0.7505,0.43112],[0.75051,0.42955],[0.75052,0.42798],[0.75049,0.42639],[0.75046,0.42479],[0.75045,0.42321],[0.75045,0.42164],[0.75044,0.42006],[0.75043,0.41848],[0.14162,0.90299],[0.14173,0.90182],[0.14184,0.90065],[0.14195,0.89949],[0.14206,0.89833],[0.14217,0.89717],[0.14228,0.89602],[0.14239,0.89487],[0.14249,0.89372],[0.14256,0.89226],[0.14259,0.89103],[0.14262,0.8898],[0.14269,0.88859],[0.14277,0.88739],[0.00306,0.70694],[0.0046,0.70694],[0.00614,0.70693],[0.00768,0.70692],[0.00923,0.70692],[0.01077,0.70691],[0.01231,0.70691],[0.01386,0.70691],[0.01541,0.70691],[0.01695,0.70691],[0.0185,0.7069],[0.02005,0.7069],[0.0216,0.7069],[0.02314,0.7069],[0.02469,0.7069],[0.02624,0.7069],[0.02779,0.7069],[0.02933,0.7069],[0.03088,0.7069],[0.03243,0.7069],[0.03397,0.7069],[0.03552,0.7069],[0.03706,0.7069],[0.03861,0.7069],[0.04015,0.70691],[0.0417,0.70691],[0.04324,0.70691],[0.04479,0.70691],[0.04633,0.70691],[0.04788,0.70691],[0.04942,0.70691],[0.05097,0.70691],[0.05251,0.70691],[0.05405,0.70691],[0.0556,0.70691],[0.05714,0.70691],[0.05869,0.70691],[0.06023,0.70692],[0.06178,0.70692],[0.06332,0.70692],[0.06487,0.70692],[0.06641,0.70692],[0.06796,0.70692],[0.22206,0.98038],[0.22346,0.98123],[0.54357,0.83808],[0.54358,0.83967],[0.54356,0.84124],[0.54356,0.84124],[0.7827,0.68302],[0.78405,0.68232],[0.41383,0.04426],[0.54357,0.84896],[0.54358,0.85048],[0.54359,0.852],[0.54361,0.85351],[0.54364,0.85502],[0.06588,0.23046],[0.06422,0.23042],[0.06266,0.23042],[0.0611,0.23042],[0.05955,0.23043],[0.058,0.23047],[0.05645,0.23047],[0.0549,0.23046],[0.05335,0.23047],[0.0518,0.23047],[0.05027,0.23048],[0.04877,0.2305],[0.54373,0.87553],[0.54371,0.87725],[0.54373,0.87875],[0.54376,0.88025],[0.82662,0.38669],[0.14021,0.54777],[0.14008,0.54936],[0.13986,0.5512],[0.13972,0.55295],[0.13959,0.55445],[0.80655,0.60403],[0.80819,0.60406],[0.80985,0.60412],[0.81136,0.60411],null,null,null,null,null,null,null,null,null,[0.52829,0.49317],[0.52666,0.49329],[0.24292,0.73304],[0.24295,0.73455],[0.24298,0.73605],[0.24306,0.73764],[0.2431,0.73947],[0.24315,0.74099],[0.24318,0.74252],[0.2434,0.74396],[0.24376,0.74535],[0.24398,0.74679],[0.24355,0.74859],[0.74887,0.43582],[0.74889,0.43425],[0.7489,0.43268],[0.74891,0.43111],[0.74893,0.42954],[0.74894,0.42797],[0.74895,0.4264],[0.74897,0.42482],[0.13995,0.90759],[0.1401,0.90646],[0.14026,0.90527],[0.74883,0.41847],[0.14045,0.90292],[0.14056,0.90175],[0.14067,0.9006],[0.14078,0.89945],[0.14089,0.89829],[0.141,0.89714],[0.1411,0.89599],[0.14121,0.89484],[0.14132,0.89369],[0.14137,0.89224],[0.1414,0.89101],[0.14143,0.88978],[0.14146,0.88856],[0.14152,0.88734],[0.44905,0.63822],[0.449,0.63668],[0.44898,0.63514],[0.44899,0.6336],[0.449,0.63206],[0.44901,0.63052],[0.44902,0.62898],[0.44902,0.62744],[0.44903,0.6259],[0.44904,0.62436],[0.44905,0.62282],[0.44906,0.62127],[0.44907,0.61973],[0.44908,0.61819],[0.44908,0.61665],[0.44909,0.61511],[0.44909,0.61358],[0.4491,0.61204],[0.4491,0.6105],[0.44911,0.60896],[0.44911,0.60742],[0.44912,0.60588],[0.44912,0.60434],[0.44913,0.6028],[0.44914,0.60126],[0.44916,0.59972],[0.44917,0.59818],[0.44919,0.59664],[0.44921,0.5951],[0.44923,0.59356],[0.44925,0.59202],[0.44927,0.59048],[0.44928,0.58894],[0.4493,0.5874],[0.44932,0.58586],[0.44934,0.58432],[0.44936,0.58278],[0.44939,0.58124],[0.44941,0.5797],[0.44944,0.57817],[0.44947,0.57663],[0.44949,0.57509],[0.44952,0.57355],[0.22092,0.98167],[0.22092,0.98167],[0.54521,0.83807],[0.54521,0.83966],[0.54521,0.84124],[0.54512,0.84284],[0.78335,0.68447],[0.5451,0.8459],[0.54512,0.84742],[0.54513,0.84894],[0.54514,0.85046],[0.54515,0.85198],[0.54516,0.8535],[0.54517,0.85502],[0.06597,0.232],[0.06423,0.23195],[0.06267,0.23195],[0.06111,0.23195],[0.05955,0.23195],[0.058,0.23199],[0.62883,0.22236],[0.62892,0.22084],[0.0534,0.23204],[0.05186,0.23204],[0.05033,0.23204],[0.0488,0.23205],[0.54531,0.87551],[0.54533,0.87722],[0.54535,0.87872],[0.54538,0.88022],[0.13883,0.54615],[0.13866,0.54767],[0.13852,0.54925],[0.13833,0.55105],[0.13824,0.55287],[0.13811,0.55437],[0.8067,0.60251],[0.80827,0.60251],[0.80983,0.60253],[0.81131,0.60251],null,null,null,null,null,null,null,null,null,[0.24134,0.73006],[0.24137,0.73158],[0.2414,0.73308],[0.24143,0.73459],[0.24146,0.73609],[0.24155,0.73768],[0.24157,0.73956],[0.24159,0.7411],[0.83259,0.63201],[0.83345,0.63343],[0.13621,0.21165],[0.24266,0.7468],[0.24205,0.7487],[0.24197,0.75022],[0.47904,0.36369],[0.13765,0.91448],[0.1378,0.91331],[0.13796,0.91215],[0.13811,0.91098],[0.13827,0.90981],[0.13842,0.90865],[0.13858,0.90748],[0.13873,0.90632],[0.13893,0.90515],[0.13912,0.90399],[0.13925,0.90282],[0.13935,0.90165],[0.13946,0.90047],[0.13956,0.89929],[0.13967,0.89811],[0.13977,0.89693],[0.13987,0.89575],[0.13998,0.89457],[0.14008,0.89339],[0.14014,0.89218],[0.14011,0.89094],[0.74494,0.28539],[0.86587,0.60316],[0.86566,0.60464],[0.14014,0.88587],[0.13999,0.88426],[0.13983,0.88263],[0.13966,0.88097],[0.13949,0.87932],[0.13931,0.87766],[0.13914,0.876],[0.13897,0.87435],[0.1388,0.87269],[0.13862,0.87104],[0.13845,0.86938],[0.13828,0.86772],[0.1381,0.86607],[0.13793,0.86441],[0.13777,0.86275],[0.13761,0.8611],[0.13746,0.85945],[0.1373,0.85779],[0.13715,0.85614],[0.13699,0.85449],[0.13682,0.85284],[0.13664,0.85118],[0.13646,0.84953],[0.13628,0.84788],[0.1361,0.84623],[0.13592,0.84457],[0.13576,0.84292],[0.1356,0.84127],[0.13544,0.83962],[0.13528,0.83796],[0.13512,0.83631],[0.13496,0.83466],[0.1348,0.833],[0.13465,0.83135],[0.1345,0.8297],[0.13435,0.82804],[0.1342,0.82639],[0.13405,0.82473],[0.13389,0.82308],[0.13374,0.82143],[0.13374,0.82143],[0.21757,0.98058],[0.21867,0.98167],[0.39595,0.24354],[0.39431,0.24335],[0.39266,0.24397],[0.39266,0.24397],[0.54704,0.84119],[0.54683,0.84274],[0.54683,0.84428],[0.54683,0.84581],[0.54683,0.84735],[0.54683,0.84888],[0.54682,0.85042],[0.54682,0.85195],[0.54681,0.85349],[0.5468,0.85502],[0.06603,0.23352],[0.54691,0.85818],[0.5469,0.85975],[0.5469,0.86132],[0.54689,0.86289],[0.54689,0.86446],[0.54688,0.86603],[0.54688,0.8676],[0.54687,0.86917],[0.54687,0.87074],[0.54687,0.8723],[0.54687,0.87387],[0.5469,0.87545],[0.54696,0.8772],[0.83386,0.95859],[0.62933,0.18718],[0.00517,0.15106],[0.68009,0.70468],[0.13697,0.54908],[0.13681,0.55089],[0.13672,0.55277],[0.13659,0.55431],[0.13646,0.55581],[0.80828,0.60093],[0.80984,0.60093],[0.81127,0.60091],null,null,null,null,null,null,null,null,null,[0.23982,0.73013],[0.23985,0.73165],[0.23988,0.73313],[0.23991,0.73462],[0.23994,0.73613],[0.24003,0.73773],[0.11578,0.13199],[0.67273,0.12227],[0.86476,0.54833],[0.86501,0.54698],[0.86519,0.54516],[0.1385,0.21228],[0.24056,0.74881],[0.24052,0.75019],[0.24052,0.75168],[0.24051,0.75317],[0.24051,0.75467],[0.2405,0.75616],[0.24049,0.75766],[0.24047,0.75915],[0.13717,0.90847],[0.13737,0.9073],[0.13755,0.90615],[0.1377,0.90498],[0.13787,0.9038],[0.13799,0.90262],[0.1381,0.90147],[0.13821,0.90032],[0.13833,0.89917],[0.13845,0.89802],[0.13852,0.89682],[0.1386,0.89562],[0.13871,0.89444],[0.13881,0.89326],[0.13886,0.89199],[0.90528,0.81633],[0.90528,0.81633],[0.90528,0.81633],[0.22223,0.31492],[0.22223,0.31492],[0.13829,0.88445],[0.13815,0.88281],[0.13798,0.88116],[0.13781,0.8795],[0.13763,0.87784],[0.13746,0.87619],[0.13729,0.87453],[0.13711,0.87288],[0.13694,0.87121],[0.13677,0.86955],[0.1366,0.86789],[0.13642,0.86622],[0.13626,0.86457],[0.1361,0.86291],[0.13595,0.86126],[0.13579,0.85961],[0.13562,0.85796],[0.13544,0.8563],[0.13526,0.85465],[0.13508,0.853],[0.13492,0.85135],[0.13475,0.8497],[0.13458,0.84804],[0.13441,0.84639],[0.13425,0.84474],[0.13408,0.84309],[0.13391,0.84144],[0.13375,0.83979],[0.13359,0.83813],[0.13344,0.83648],[0.13328,0.83482],[0.13312,0.83317],[0.13296,0.83152],[0.1328,0.82986],[0.13265,0.82821],[0.13249,0.82656],[0.13233,0.8249],[0.13216,0.82325],[0.21424,0.97955],[0.21534,0.98063],[0.21643,0.98173],[0.29124,0.08573],[0.29124,0.08573],[0.29124,0.08573],[0.29124,0.08573],[0.39087,0.24208],[0.39087,0.24208],[0.54848,0.84282],[0.54848,0.84435],[0.54848,0.84589],[0.54847,0.84742],[0.54847,0.84896],[0.54848,0.85049],[0.54848,0.85202],[0.54848,0.85355],[0.5485,0.85507],[0.5485,0.85661],[0.5485,0.85818],[0.5485,0.85976],[0.5485,0.86132],[0.54851,0.86288],[0.54852,0.86443],[0.54852,0.86599],[0.54853,0.86755],[0.54853,0.86912],[0.54853,0.87068],[0.54853,0.87225],[0.54853,0.87381],[0.54853,0.87538],[0.8342,0.95639],[0.8342,0.95639],[0.8342,0.95639],[0.96127,0.3418],[0.96127,0.3418],[0.62486,0.18989],[0.13527,0.55074],[0.13517,0.55259],[0.13504,0.55417],[0.13491,0.55576],[0.80827,0.59934],[0.80986,0.59931],[0.81122,0.59931],null,null,null,null,null,null,null,null,null,[0.23829,0.73021],[0.23832,0.7317],[0.23836,0.73318],[0.23839,0.73466],[0.23842,0.73617],[0.23852,0.73777],[0.67504,0.12235],[0.67504,0.12235],[0.86306,0.54835],[0.86337,0.54665],[0.86362,0.54499],[0.86362,0.54499],[0.86362,0.54499],[0.23907,0.75016],[0.23906,0.75166],[0.23905,0.75316],[0.23904,0.75465],[0.23903,0.75615],[0.23902,0.75766],[0.23901,0.75916],[0.23901,0.76064],[0.23901,0.76212],[0.13628,0.90597],[0.13645,0.9048],[0.13661,0.90362],[0.13673,0.90243],[0.13684,0.90127],[0.13694,0.90012],[0.13706,0.89897],[0.13718,0.89782],[0.13729,0.89668],[0.13741,0.89553],[0.13753,0.89438],[0.13761,0.89319],[0.74704,0.28994],[0.74704,0.28994],[0.24422,0.05985],[0.24584,0.06022],[0.24584,0.06022],[0.24584,0.06022],[0.92753,0.59865],[0.13647,0.883],[0.1363,0.88134],[0.13612,0.87968],[0.13595,0.87802],[0.13578,0.87636],[0.13561,0.87469],[0.13543,0.87303],[0.13526,0.87137],[0.13509,0.8697],[0.13492,0.86804],[0.13475,0.86638],[0.13459,0.86473],[0.13441,0.86307],[0.13424,0.86142],[0.13408,0.85977],[0.13391,0.85812],[0.13374,0.85647],[0.13357,0.85482],[0.13341,0.85317],[0.13324,0.85151],[0.13307,0.84986],[0.13291,0.84821],[0.13274,0.84656],[0.13257,0.84491],[0.1324,0.84326],[0.13224,0.84161],[0.13207,0.83995],[0.1319,0.8383],[0.13174,0.83665],[0.13157,0.835],[0.13142,0.83334],[0.13127,0.83168],[0.13112,0.83003],[0.13097,0.82837],[0.13081,0.82672],[0.13064,0.82508],[0.21209,0.97957],[0.21318,0.98054],[0.21426,0.98148],[0.29337,0.08748],[0.89709,0.82735],[0.89709,0.82735],[0.89709,0.82735],[0.89709,0.82735],[0.89709,0.82735],[0.89709,0.82735],[0.55002,0.84286],[0.55002,0.84439],[0.55002,0.84592],[0.55004,0.84744],[0.55006,0.84895],[0.55008,0.85047],[0.55008,0.85199],[0.55007,0.85353],[0.55006,0.85506],[0.55006,0.85661],[0.55007,0.85818],[0.55007,0.85975],[0.55007,0.86133],[0.55007,0.8629],[0.55007,0.86447],[0.55007,0.86605],[0.55007,0.86762],[0.55007,0.86919],[0.55007,0.87077],[0.55008,0.87233],[0.55008,0.87388],[0.55009,0.87544],[0.55009,0.87544],[0.55009,0.87544],[0.55009,0.87544],[0.55009,0.87544],[0.55009,0.87544],[0.62341,0.18878],[0.13374,0.55061],[0.91597,0.95486],[0.91641,0.95639],[0.91685,0.95792],[0.13343,0.55716],[0.80987,0.5977],[0.81118,0.59771],null,null,null,null,null,null,null,null,null,[0.23677,0.73027],[0.2368,0.73175],[0.23684,0.73324],[0.23687,0.73472],[0.2369,0.7362],[0.237,0.73781],[0.67648,0.12175],[0.67504,0.12235],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.91036,0.83773],[0.91195,0.8378],[0.91357,0.83785],null,null,null,null,null,null,null,[0.82081,0.69298],[0.82081,0.69461],[0.8208,0.69624],[0.82079,0.69787],[0.82078,0.69949],[0.07648,0.59613],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.59278,0.89171],[0.59279,0.89012],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.55009,0.87544],[0.13208,0.55243],[0.13208,0.55243],[0.13208,0.55243],[0.13203,0.55399],[0.13199,0.55557],[0.13203,0.55715],[0.13188,0.55883],[0.81113,0.59612],null,null,null,null,null,null,null,null,null,[0.23525,0.73033],[0.23528,0.73181],[0.23531,0.73329],[0.23535,0.73477],[0.23538,0.73625],[0.23548,0.73785],[0.23548,0.73785],[0.67504,0.12235],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.55009,0.87544],[0.62029,0.18766],[0.51564,0.39636],[0.13058,0.55238],[0.13058,0.55238],[0.13056,0.55553],[0.13064,0.55711],[0.57598,0.31948],[0.57508,0.31796],null,null,null,null,null,null,null,null,null,[0.20861,0.24286],[0.20861,0.24443],[0.20861,0.246],[0.20861,0.24758],[0.2086,0.24915],[0.20866,0.25085],[0.20866,0.25085],[0.67504,0.12235],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.55009,0.87544],[0.69529,0.47895],[0.12918,0.55067],[0.12874,0.55226],[0.12875,0.55392],[0.12876,0.55559],[0.12881,0.55718],[0.12881,0.55875],[0.1288,0.56031],null,null,null,null,null,null,null,null,null,[0.20703,0.24285],[0.20703,0.24443],[0.20703,0.246],[0.20703,0.24757],[0.20702,0.24914],[0.20707,0.25084],[0.23229,0.73984],[0.02212,0.20887],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.69313,0.47977],[0.68031,0.08113],[0.36443,0.49607],[0.1271,0.55249],[0.12721,0.5541],[0.1273,0.55568],[0.69466,0.04226],[0.12729,0.5588],[0.12729,0.5588],null,null,null,null,null,null,null,null,null,[0.20546,0.24285],[0.20545,0.24442],[0.20545,0.24599],[0.20545,0.24756],[0.20544,0.24913],[0.20548,0.25084],[0.23072,0.73986],[0.23071,0.74135],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12645,0.54921],[0.68182,0.08044],[0.36588,0.49657],[0.12557,0.55263],[0.12568,0.55424],[0.12576,0.55578],[0.12588,0.55739],[0.8738,0.20338],[0.12593,0.56048],null,null,null,null,null,null,null,null,null,[0.20389,0.24284],[0.20387,0.24441],[0.20387,0.24598],[0.20386,0.24755],[0.20386,0.24912],[0.20389,0.25083],[0.22915,0.73986],[0.22915,0.74137],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12491,0.54911],[0.12479,0.55068],[0.36736,0.49702],[0.12403,0.55276],[0.12414,0.55438],[0.12423,0.55588],[0.12434,0.55748],[0.12441,0.55906],[0.12441,0.5606],null,null,null,null,null,null,null,null,null,[0.20232,0.24283],[0.2023,0.2444],[0.20229,0.24597],[0.20228,0.24755],[0.20228,0.24912],[0.2023,0.25083],[0.22758,0.73985],[0.22759,0.74139],[0.22759,0.74139],[0.1551,0.76535],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12337,0.549],[0.12325,0.55058],[0.36885,0.49743],[0.12249,0.5529],[0.1226,0.55451],[0.12269,0.55599],[0.1228,0.55757],[0.12286,0.55916],[0.1229,0.56072],null,null,null,null,null,null,null,null,null,[0.20074,0.24282],[0.20073,0.24439],[0.20071,0.24597],[0.2007,0.24754],[0.2007,0.24911],[0.20071,0.25083],[0.22601,0.73984],[0.22602,0.74142],[0.22602,0.74142],[0.15481,0.76671],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12183,0.54888],[0.1217,0.55048],[0.37034,0.49785],[0.12096,0.55304],[0.12106,0.55462],[0.12115,0.5561],[0.12126,0.55768],[0.12131,0.55926],[0.12138,0.56084],null,null,null,null,null,null,null,null,null,[0.19917,0.24281],[0.19915,0.24439],[0.19914,0.24596],[0.19912,0.24753],[0.19912,0.2491],[0.19912,0.25082],[0.22444,0.73984],[0.22446,0.74144],[0.22446,0.74144],[0.15451,0.76807],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12029,0.54878],[0.12017,0.55038],[0.11982,0.55203],[0.11942,0.55318],[0.11952,0.55472],[0.11961,0.55621],[0.11972,0.5578],[0.11977,0.55937],[0.11986,0.56096],null,null,null,null,null,null,null,null,null,[0.1976,0.2428],[0.19758,0.24438],[0.19757,0.24595],[0.19755,0.24752],[0.19754,0.2491],[0.19754,0.25082],[0.22287,0.73983],[0.2229,0.74146],[0.2229,0.74146],[0.15421,0.76943],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11874,0.54868],[0.11863,0.55028],[0.11838,0.55192],[0.11788,0.55331],[0.11798,0.55483],[0.11806,0.55633],[0.11818,0.55791],[0.11825,0.55949],[0.11834,0.56109],null,null,null,null,null,null,null,null,null,[0.19603,0.2428],[0.19601,0.24437],[0.19599,0.24594],[0.19598,0.24751],[0.19596,0.24909],[0.19596,0.25082],[0.2213,0.73982],[0.22134,0.74148],[0.22134,0.74148],[0.15392,0.77079],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1172,0.54859],[0.11709,0.55018],[0.11695,0.5518],[0.11635,0.55345],[0.11643,0.55494],[0.11652,0.55644],[0.89193,0.91338],[0.11673,0.55962],[0.11682,0.56122],null,null,null,null,null,null,null,null,null,[0.19446,0.24279],[0.19444,0.24436],[0.19442,0.24593],[0.1944,0.24751],[0.19439,0.24908],[0.19438,0.25082],[0.21972,0.73982],[0.21977,0.74148],[0.21977,0.74148],[0.15362,0.77215],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11565,0.54849],[0.11555,0.55008],[0.11544,0.55183],[0.37684,0.49794],[0.37737,0.49646],[0.37737,0.49646],[0.11508,0.55816],[0.11519,0.55975],[0.1153,0.56135],null,null,null,null,null,null,null,null,null,[0.21795,0.73177],[0.21795,0.73177],[0.21798,0.73332],[0.21802,0.73487],[0.21805,0.73642],[0.21811,0.7382],[0.21815,0.73981],[0.2182,0.74147],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11414,0.5484],[0.11398,0.54997],[0.11398,0.54997],[0.11403,0.5533],[0.11377,0.55505],[0.11377,0.55505],[0.11367,0.55826],[0.11348,0.55987],[0.11329,0.56145],null,null,null,null,null,null,null,null,null,[0.21636,0.73025],[0.21639,0.7318],[0.21643,0.73335],[0.21646,0.7349],[0.2165,0.73645],[0.21655,0.73822],[0.21659,0.73984],[0.21662,0.74147],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11263,0.54832],[0.11247,0.54988],[0.11247,0.54988],[0.11243,0.55327],[0.11226,0.55494],[0.11213,0.55656],[0.11201,0.55815],[0.11189,0.55973],[0.11177,0.56131],null,null,null,null,null,null,null,null,null,[0.21481,0.73027],[0.21484,0.73182],[0.21488,0.73337],[0.21491,0.73492],[0.21495,0.73647],[0.21498,0.73825],[0.21503,0.73987],[0.21506,0.74149],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11113,0.54824],[0.11097,0.5498],[0.11097,0.5498],[0.11083,0.55325],[0.11066,0.55492],[0.11058,0.55647],[0.11046,0.55805],[0.11034,0.55963],[0.11023,0.56121],null,null,null,null,null,null,null,null,null,[0.21325,0.7303],[0.21329,0.73185],[0.21332,0.7334],[0.21336,0.73495],[0.21339,0.7365],[0.21342,0.73827],[0.21347,0.73991],[0.2135,0.74153],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10963,0.54816],[0.10949,0.54968],[0.10925,0.55128],[0.10923,0.55322],[0.1091,0.55479],[0.10903,0.55637],[0.10891,0.55796],[0.10879,0.55954],[0.10869,0.56112],null,null,null,null,null,null,null,null,null,[0.21169,0.73031],[0.21173,0.73188],[0.21177,0.73343],[0.2118,0.73498],[0.21184,0.73653],[0.21185,0.7383],[0.21191,0.73994],[0.21194,0.74156],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10812,0.54808],[0.10791,0.54954],[0.10771,0.55117],[0.88677,0.49298],[0.10755,0.55469],[0.10748,0.55628],[0.10736,0.55786],[0.10724,0.55944],[0.10715,0.56102],null,null,null,null,null,null,null,null,null,[0.21014,0.73032],[0.21018,0.73191],[0.21021,0.73346],[0.21025,0.73501],[0.21028,0.73656],[0.21029,0.73833],[0.21035,0.73998],[0.21038,0.7416],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10662,0.54801],[0.10633,0.54941],[0.10617,0.55106],[0.10607,0.55301],[0.106,0.5546],[0.10592,0.55618],[0.10581,0.55777],[0.1057,0.55935],[0.10715,0.56102],null,null,null,null,null,null,null,null,null,[0.20858,0.73033],[0.20862,0.73194],[0.20866,0.73349],[0.20869,0.73504],[0.20873,0.73659],[0.20872,0.73835],[0.20879,0.74001],[0.20882,0.74163],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10511,0.54793],[0.10476,0.54928],[0.10462,0.55095],[0.10452,0.55292],[0.10444,0.5545],[0.10437,0.55609],[0.10426,0.55767],[0.10416,0.55925],[0.10715,0.56102],null,null,null,null,null,null,null,null,null,[0.20702,0.73034],[0.20707,0.73196],[0.20711,0.73352],[0.20714,0.73507],[0.20718,0.73662],[0.20716,0.73838],[0.20723,0.74005],[0.20726,0.74167],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10356,0.54779],[0.10319,0.54914],[0.10308,0.55085],[0.10298,0.55282],[0.10289,0.55441],[0.10281,0.55599],[0.10271,0.55758],[0.10262,0.55915],[0.10715,0.56102],null,null,null,null,null,null,null,null,null,[0.20546,0.73038],[0.20551,0.73197],[0.20555,0.73355],[0.20559,0.7351],[0.20562,0.73665],[0.20559,0.7384],[0.20566,0.74008],[0.2057,0.7417],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10198,0.54766],[0.10165,0.54903],[0.10153,0.55075],[0.10144,0.55272],[0.10135,0.55431],[0.10126,0.5559],[0.10117,0.55748],[0.10108,0.55906],[0.41946,0.38209],null,null,null,null,null,null,null,null,null,[0.20391,0.73042],[0.20396,0.73198],[0.204,0.73357],[0.20403,0.73512],[0.20407,0.73667],[0.20403,0.73842],[0.2041,0.74011],[0.20414,0.74173],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.10036,0.54748],[0.1001,0.54892],[0.09999,0.55066],[0.09989,0.55262],[0.0998,0.55421],[0.09971,0.5558],[0.87264,0.46072],[0.09954,0.55894],[0.421,0.38209],null,null,null,null,null,null,null,null,null,[0.20235,0.73046],[0.2024,0.73199],[0.20244,0.7336],[0.20248,0.73515],[0.20251,0.7367],[0.20246,0.73845],[0.20254,0.74015],[0.20258,0.74176],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.09876,0.54732],[0.09855,0.54882],[0.09844,0.55056],[0.09835,0.55252],[0.09826,0.55411],[0.09817,0.5557],[0.87258,0.45907],[0.09798,0.55886],[0.42253,0.3821],null,null,null,null,null,null,null,null,null,[0.20079,0.7305],[0.20084,0.73203],[0.20089,0.73362],[0.20092,0.73518],[0.20096,0.73673],[0.2009,0.73847],[0.20098,0.74018],[0.20102,0.74179],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.09716,0.54717],[0.097,0.54871],[0.09689,0.55046],[0.0968,0.55241],[0.09671,0.55401],[0.09662,0.55561],[0.09653,0.55721],[0.41373,0.51463],[0.42407,0.38211],null,null,null,null,null,null,null,null,null,[0.19923,0.73055],[0.19928,0.73207],[0.19933,0.73363],[0.19937,0.73521],[0.19941,0.73676],[0.19933,0.73849],[0.19942,0.74022],[0.19946,0.74182],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.09559,0.54703],[0.09546,0.54861],[0.09534,0.55037],[0.09526,0.55231],[0.09517,0.55392],[0.09508,0.55552],[0.095,0.55711],[0.09489,0.5587],[0.4256,0.38212],null,null,null,null,null,null,null,null,null,[0.19767,0.73059],[0.19772,0.73211],[0.19777,0.73364],[0.19782,0.73524],[0.19785,0.73679],[0.19777,0.73851],[0.19786,0.74025],[0.1979,0.74185],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.09405,0.54692],[0.09391,0.5485],[0.09391,0.5485],[0.09371,0.55223],[0.09362,0.55383],[0.09353,0.55543],[0.09347,0.55701],[0.09335,0.5586],[0.42713,0.38213],null,null,null,null,null,null,null,null,null,[0.19612,0.73063],[0.19617,0.73216],[0.19622,0.73368],[0.19626,0.73527],[0.1963,0.73682],[0.1962,0.73854],[0.1963,0.74029],[0.19634,0.74188],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.0925,0.5468],[0.09236,0.54839],[0.09236,0.54839],[0.09217,0.55214],[0.09208,0.55375],[0.09199,0.55534],[0.09193,0.55692],[0.42864,0.38384],[0.42867,0.38213],null,null,null,null,null,null,null,null,null,[0.19456,0.73067],[0.19461,0.7322],[0.19466,0.73372],[0.19471,0.73529],[0.19474,0.73685],[0.19464,0.73856],[0.19474,0.74032],[0.19479,0.74189],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.09096,0.54668],[0.09082,0.54829],[0.09082,0.54829],[0.09062,0.55206],[0.09053,0.55366],[0.09044,0.55525],[0.09039,0.55683],[0.09024,0.55846],[0.4302,0.38214],null,null,null,null,null,null,null,null,null,[0.193,0.73072],[0.19305,0.73224],[0.1931,0.73377],[0.19315,0.7353],[0.19319,0.73687],[0.19307,0.73858],[0.19318,0.74035],[0.19323,0.74191],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.08942,0.54656],[0.08928,0.54818],[0.08928,0.54818],[0.08908,0.55198],[0.08899,0.55357],[0.0889,0.55515],[0.08885,0.55673],[0.43171,0.38379],[0.43172,0.38216],null,null,null,null,null,null,null,null,null,[0.19144,0.73076],[0.19149,0.73228],[0.19154,0.73381],[0.19159,0.73533],[0.19164,0.7369],[0.1915,0.73861],[0.19162,0.74039],[0.19167,0.74192],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.08788,0.54644],[0.08774,0.54806],[0.24972,0.35648],[0.08753,0.55189],[0.08744,0.55347],[0.08735,0.55506],[0.08731,0.55664],[0.43325,0.3838],[0.43325,0.38218],null,null,null,null,null,null,null,null,null,[0.18988,0.7308],[0.18993,0.73233],[0.18998,0.73385],[0.19003,0.73538],[0.19008,0.73693],[0.18994,0.73863],[0.19006,0.74042],[0.19012,0.74193],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.08634,0.54633],[0.0959,0.08267],[0.24812,0.35658],[0.08599,0.55179],[0.0859,0.55338],[0.0858,0.55497],[0.08577,0.55655],[0.43479,0.38382],[0.43477,0.3822],null,null,null,null,null,null,null,null,null,[0.18833,0.73084],[0.18838,0.73237],[0.18843,0.73389],[0.18848,0.73542],[0.18853,0.73695],[0.18838,0.73865],[0.18849,0.74046],[0.18856,0.74194],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.0848,0.54621],[0.08468,0.5478],[0.24652,0.35668],[0.08444,0.5517],[0.08435,0.55329],[0.08425,0.55487],[0.08425,0.55487],[0.43633,0.38384],[0.4363,0.38222],null,null,null,null,null,null,null,null,null,[0.18677,0.73089],[0.18682,0.73241],[0.18687,0.73394],[0.18692,0.73546],[0.18697,0.73699],[0.18683,0.73868],[0.18694,0.74049],[0.18701,0.74196],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.08326,0.5461],[0.81368,0.61206],[0.24493,0.35672],[0.0829,0.5516],[0.08281,0.55319],[0.08273,0.55477],[0.43791,0.38555],[0.43787,0.38388],[0.43783,0.38223],null,null,null,null,null,null,null,null,null,[0.18521,0.73093],[0.18526,0.73246],[0.18531,0.73398],[0.18536,0.73551],[0.18541,0.73703],[0.18528,0.73871],[0.18538,0.7405],[0.18545,0.74197],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.1852,0.31611],[0.4792,0.14212],[0.27717,0.08286],[0.24335,0.35673],[0.24341,0.35854],[0.08126,0.5531],[0.08114,0.5547],[0.08098,0.55627],[0.08089,0.55783],[0.43783,0.38223],null,null,null,null,null,null,null,null,null,[0.18331,0.73105],[0.18338,0.73259],[0.18345,0.73414],[0.18353,0.73568],[0.18361,0.73723],[0.18369,0.73878],[0.77488,0.24177],[0.84007,0.09597],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.81664,0.41647],[0.65149,0.05914],[0.65149,0.05914],[0.24167,0.35674],[0.24142,0.35834],[0.24126,0.35992],[0.24111,0.36149],[0.24097,0.36305],[0.24083,0.36462],[0.24068,0.36618],null,null,null,null,null,null,null,null,null,[0.18175,0.7311],[0.18183,0.73265],[0.18191,0.7342],[0.18198,0.73574],[0.18206,0.73729],[0.18214,0.73884],[0.18214,0.73884],[0.18214,0.73884],[0.18214,0.73884],[0.8668,0.24169],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.81664,0.41647],[0.65149,0.05914],[0.65149,0.05914],[0.23986,0.3582],[0.23986,0.3582],[0.23972,0.35976],[0.23959,0.36132],[0.23945,0.36289],[0.23931,0.36445],[0.23915,0.36601],null,null,null,null,null,null,null,null,null,[0.1802,0.73115],[0.18028,0.73271],[0.18036,0.73426],[0.18044,0.7358],[0.18051,0.73735],[0.18059,0.7389],[0.87765,0.4633],[0.18214,0.73884],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.81664,0.41647],[0.65149,0.05914],[0.65149,0.05914],[0.80049,0.92585],[0.23835,0.35803],[0.23821,0.35959],[0.23807,0.36115],[0.23793,0.36271],[0.23779,0.36429],[0.2376,0.36583],null,null,null,null,null,null,null,null,null,[0.17865,0.73119],[0.17873,0.73277],[0.17881,0.73432],[0.17889,0.73586],[0.17897,0.73741],[0.17904,0.739],[0.8772,0.46183],[0.18214,0.73884],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.81664,0.41647],[0.65149,0.05914],[0.65149,0.05914],[0.53998,0.34384],[0.23683,0.35786],[0.23669,0.35942],[0.23656,0.36098],[0.23641,0.36255],[0.23626,0.36414],[0.23606,0.36566],null,null,null,null,null,null,null,null,null,[0.1771,0.73124],[0.17718,0.73281],[0.17726,0.73437],[0.17734,0.73592],[0.17742,0.73747],[0.17749,0.73908],[0.87675,0.46042],[0.18214,0.73884],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1852,0.31611],[0.81664,0.41647],[0.65149,0.05914],[0.61773,0.16245],[0.61773,0.16245],[0.23532,0.35768],[0.23518,0.35925],[0.23504,0.36082],[0.23488,0.36241],[0.23471,0.36397],[0.23451,0.36548],null,null,null,null,null,null,null,null,null,[0.17555,0.73132],[0.17563,0.73285],[0.17571,0.73443],[0.17579,0.73598],[0.17587,0.73753],[0.17594,0.73917],[0.17598,0.74096],[0.17604,0.74251],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.43714,0.14782],[0.43714,0.14782],[0.49685,0.99075],[0.49846,0.99075],[0.48771,0.85852],[0.2338,0.35751],[0.23366,0.35908],[0.23351,0.36067],[0.23336,0.36226],[0.23317,0.36379],[0.23299,0.36533],null,null,null,null,null,null,null,null,null,[0.17399,0.73141],[0.17408,0.73294],[0.17416,0.73447],[0.17425,0.73604],[0.17432,0.73759],[0.17439,0.73925],[0.17443,0.74101],[0.17451,0.74258],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49685,0.98923],[0.49846,0.98923],[0.103,0.98233],[0.23229,0.35734],[0.23214,0.35893],[0.23198,0.36052],[0.23183,0.3621],[0.23162,0.36361],[0.23146,0.36519],null,null,null,null,null,null,null,null,null,[0.17244,0.73149],[0.17253,0.73302],[0.17261,0.73455],[0.17269,0.73609],[0.17277,0.73765],[0.17284,0.73934],[0.17287,0.74104],[0.17295,0.74264],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49683,0.9877],[0.49846,0.98771],[0.1046,0.98228],[0.23076,0.35719],[0.23061,0.35878],[0.23046,0.36037],[0.23028,0.36193],[0.23008,0.36344],[0.22994,0.36504],null,null,null,null,null,null,null,null,null,[0.17089,0.73157],[0.17098,0.7331],[0.17106,0.73463],[0.17114,0.73616],[0.17123,0.7377],[0.17129,0.7394],[0.17131,0.74108],[0.17139,0.74269],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49682,0.98617],[0.49846,0.98618],[0.48735,0.86305],[0.22922,0.35705],[0.22908,0.35863],[0.22893,0.36022],[0.22874,0.36175],[0.22853,0.36326],[0.22842,0.36489],null,null,null,null,null,null,null,null,null,[0.16934,0.73166],[0.16943,0.73319],[0.16951,0.73472],[0.16959,0.73625],[0.16968,0.73778],[0.16974,0.73945],[0.16975,0.74111],[0.16983,0.74273],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.4968,0.98464],[0.49845,0.98466],[0.48734,0.86459],[0.79946,0.91519],[0.22754,0.35849],[0.22739,0.36006],[0.22719,0.36157],[0.22699,0.36308],[0.2269,0.36475],null,null,null,null,null,null,null,null,null,[0.38104,0.7592],[0.51393,0.11002],[0.51393,0.11002],[0.36,0.93882],[0.35844,0.9394],[0.35688,0.93989],[0.1682,0.74118],[0.16826,0.74277],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49679,0.9831],[0.49843,0.98312],[0.48738,0.86619],[0.45489,0.82836],[0.45644,0.82837],[0.45798,0.82838],[0.45952,0.82838],[0.46105,0.8284],[0.46257,0.8284],null,null,null,null,null,null,null,null,null,[0.38099,0.76057],[0.37949,0.76056],[0.37807,0.76058],[0.37653,0.76058],[0.37494,0.76058],[0.35736,0.94136],[0.371,0.76058],[0.36942,0.76059],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49678,0.98155],[0.49842,0.98157],[0.48739,0.86773],[0.45497,0.82682],[0.45649,0.82683],[0.458,0.82685],[0.45952,0.82687],[0.46104,0.82687],[0.46256,0.82686],null,null,null,null,null,null,null,null,null,[0.38099,0.76211],[0.37952,0.76212],[0.37808,0.76212],[0.37652,0.76214],[0.37494,0.76214],[0.35788,0.94282],[0.37098,0.76212],[0.36944,0.76214],[0.35059,0.94608],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.98001],[0.49841,0.98002],[0.4874,0.86927],[0.45495,0.8253],[0.45647,0.82532],[0.45799,0.82533],[0.45951,0.82533],[0.46103,0.82533],[0.46256,0.82532],null,null,null,null,null,null,null,null,null,[0.38099,0.76365],[0.3795,0.76366],[0.37806,0.76366],[0.37648,0.76371],[0.3749,0.7637],[0.35841,0.94428],[0.37095,0.76367],[0.36947,0.76367],[0.35059,0.94454],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.97847],[0.4984,0.97847],[0.48742,0.87082],[0.45494,0.82379],[0.45646,0.8238],[0.45798,0.82379],[0.45951,0.82379],[0.46103,0.82379],[0.46255,0.82378],null,null,null,null,null,null,null,null,null,[0.38099,0.76519],[0.37949,0.7652],[0.37804,0.7652],[0.37644,0.76526],[0.37486,0.76527],[0.35893,0.94573],[0.37093,0.76521],[0.3695,0.7652],[0.35058,0.943],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49674,0.97692],[0.49838,0.97691],[0.48743,0.87236],[0.45493,0.82226],[0.45645,0.82226],[0.45798,0.82225],[0.4595,0.82225],[0.46102,0.82225],[0.46255,0.82225],null,null,null,null,null,null,null,null,null,[0.38099,0.76672],[0.37948,0.76674],[0.378,0.76675],[0.37641,0.76681],[0.37482,0.76683],[0.37345,0.76673],[0.3709,0.76676],[0.3695,0.76674],[0.35058,0.94146],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49673,0.97538],[0.49837,0.97537],[0.48745,0.8739],[0.45493,0.82073],[0.45645,0.82072],[0.45797,0.82072],[0.4595,0.82072],[0.46102,0.82071],[0.46254,0.82071],null,null,null,null,null,null,null,null,null,[0.381,0.76826],[0.37948,0.76827],[0.37797,0.7683],[0.37637,0.76836],[0.37478,0.7684],[0.37337,0.76825],[0.37089,0.7683],[0.36951,0.76827],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49674,0.97384],[0.49836,0.97382],[0.48746,0.87544],[0.45493,0.81919],[0.45645,0.81919],[0.45797,0.81918],[0.45949,0.81918],[0.46101,0.81918],[0.46254,0.81917],null,null,null,null,null,null,null,null,null,[0.381,0.7698],[0.37947,0.76981],[0.37793,0.76985],[0.37633,0.76991],[0.37474,0.76996],[0.37329,0.76977],[0.37092,0.76984],[0.36952,0.76981],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49674,0.9723],[0.49835,0.97228],[0.48747,0.87698],[0.45491,0.81765],[0.45644,0.81765],[0.45796,0.81765],[0.45949,0.81764],[0.46101,0.81764],[0.46253,0.81764],null,null,null,null,null,null,null,null,null,[0.381,0.77134],[0.37947,0.77134],[0.3779,0.77139],[0.37629,0.77145],[0.3747,0.77151],[0.37321,0.77129],[0.37097,0.77136],[0.36952,0.77135],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49674,0.97076],[0.49836,0.97074],[0.48749,0.87852],[0.45489,0.81612],[0.45644,0.81611],[0.45796,0.81611],[0.45948,0.81611],[0.46101,0.8161],[0.46253,0.8161],null,null,null,null,null,null,null,null,null,[0.381,0.77288],[0.37947,0.77288],[0.37793,0.7729],[0.3763,0.77298],[0.37467,0.77306],[0.37467,0.77306],[0.37102,0.77288],[0.36953,0.77289],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.96922],[0.49836,0.9692],[0.4875,0.88006],[0.45486,0.81459],[0.45643,0.81458],[0.45796,0.81457],[0.45948,0.81457],[0.461,0.81457],[0.46253,0.81457],null,null,null,null,null,null,null,null,null,[0.38099,0.77442],[0.37946,0.77442],[0.37794,0.77441],[0.37633,0.77448],[0.3747,0.77456],[0.3747,0.77456],[0.37104,0.77441],[0.36953,0.77442],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.96767],[0.49837,0.96766],[0.48752,0.88161],[0.45484,0.81306],[0.45643,0.81304],[0.45795,0.81304],[0.45947,0.81304],[0.461,0.81303],[0.46252,0.81303],null,null,null,null,null,null,null,null,null,[0.38099,0.77596],[0.37946,0.77596],[0.37796,0.77595],[0.37636,0.77599],[0.37473,0.77607],[0.37473,0.77607],[0.37105,0.77595],[0.36954,0.77596],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.96613],[0.49837,0.96612],[0.48753,0.88315],[0.45482,0.81153],[0.45643,0.8115],[0.45795,0.8115],[0.45947,0.8115],[0.46099,0.8115],[0.46252,0.81149],null,null,null,null,null,null,null,null,null,[0.38099,0.7775],[0.37945,0.77749],[0.37798,0.77749],[0.37639,0.7775],[0.37476,0.77758],[0.37282,0.77736],[0.37106,0.77749],[0.36954,0.7775],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.96458],[0.49837,0.96458],[0.48754,0.88469],[0.45481,0.80999],[0.45643,0.80996],[0.45794,0.80997],[0.45947,0.80996],[0.46099,0.80996],[0.46251,0.80996],null,null,null,null,null,null,null,null,null,[0.38098,0.77903],[0.37944,0.77903],[0.378,0.77903],[0.37641,0.77902],[0.3748,0.77907],[0.37281,0.77891],[0.37107,0.77903],[0.36955,0.77903],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.96304],[0.49838,0.96304],[0.48756,0.88623],[0.4548,0.80845],[0.45643,0.80842],[0.45794,0.80843],[0.45946,0.80843],[0.46099,0.80842],[0.46251,0.80842],null,null,null,null,null,null,null,null,null,[0.38098,0.78057],[0.37944,0.78057],[0.378,0.78057],[0.37643,0.78056],[0.37486,0.78056],[0.37281,0.78046],[0.37108,0.78057],[0.36955,0.78057],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49675,0.9615],[0.49838,0.9615],[0.48757,0.88777],[0.4548,0.80691],[0.45641,0.80688],[0.45793,0.80689],[0.45946,0.80689],[0.46098,0.80689],[0.4625,0.80688],null,null,null,null,null,null,null,null,null,[0.38097,0.78211],[0.37943,0.7821],[0.87045,0.13707],[0.37645,0.7821],[0.3749,0.78208],[0.3728,0.782],[0.37109,0.7821],[0.36956,0.78211],[0.35054,0.92608],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95995],[0.49839,0.95995],[0.48759,0.88931],[0.45479,0.80537],[0.45638,0.80535],[0.45793,0.80535],[0.45945,0.80536],[0.46098,0.80535],[0.4625,0.80535],null,null,null,null,null,null,null,null,null,[0.38096,0.78365],[0.37942,0.78364],[0.87045,0.13865],[0.37639,0.78363],[0.37493,0.78361],[0.3728,0.78355],[0.3711,0.78364],[0.36957,0.78365],[0.35054,0.92455],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95841],[0.49839,0.95841],[0.4876,0.89085],[0.45479,0.80383],[0.45636,0.80382],[0.45794,0.80381],[0.45945,0.80382],[0.46097,0.80382],[0.4625,0.80381],null,null,null,null,null,null,null,null,null,[0.38096,0.78519],[0.37942,0.78518],[0.37793,0.78518],[0.3764,0.78517],[0.3749,0.78516],[0.37279,0.7851],[0.37112,0.78518],[0.36958,0.78519],[0.35054,0.92302],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95687],[0.4984,0.95687],[0.48761,0.89239],[0.45479,0.80229],[0.45634,0.80229],[0.45794,0.80227],[0.45945,0.80228],[0.46097,0.80228],[0.46249,0.80228],null,null,null,null,null,null,null,null,null,[0.38095,0.78672],[0.37942,0.78672],[0.3779,0.78672],[0.37641,0.78671],[0.37487,0.78672],[0.37279,0.78665],[0.37113,0.78672],[0.36959,0.78673],[0.35054,0.9215],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95532],[0.4984,0.95533],[0.48763,0.89394],[0.45478,0.80075],[0.45633,0.80075],[0.45794,0.80073],[0.45944,0.80075],[0.46096,0.80074],[0.46249,0.80074],null,null,null,null,null,null,null,null,null,[0.38096,0.78826],[0.37943,0.78825],[0.37789,0.78826],[0.37643,0.78825],[0.37485,0.78826],[0.37278,0.7882],[0.37114,0.78826],[0.3696,0.78827],[0.35054,0.91997],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95378],[0.49841,0.95379],[0.48764,0.89548],[0.45478,0.79921],[0.45633,0.79921],[0.45794,0.79918],[0.45944,0.79921],[0.46096,0.79921],[0.46248,0.7992],null,null,null,null,null,null,null,null,null,[0.38096,0.7898],[0.37943,0.78979],[0.37789,0.7898],[0.3764,0.7898],[0.37484,0.78981],[0.37278,0.78975],[0.37115,0.78979],[0.36961,0.78981],[0.35054,0.91841],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95223],[0.49841,0.95225],[0.48766,0.89702],[0.45477,0.79767],[0.45633,0.79767],[0.45793,0.79765],[0.45944,0.79767],[0.46096,0.79767],[0.46248,0.79767],null,null,null,null,null,null,null,null,null,[0.38097,0.79133],[0.37943,0.79134],[0.3779,0.79134],[0.37639,0.79134],[0.37482,0.79135],[0.37277,0.7913],[0.37116,0.79133],[0.3696,0.79135],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.95069],[0.49841,0.95071],[0.48767,0.89856],[0.45477,0.79613],[0.45632,0.79613],[0.4579,0.79612],[0.45944,0.79612],[0.46095,0.79614],[0.46247,0.79613],null,null,null,null,null,null,null,null,null,[0.38097,0.79287],[0.37943,0.79288],[0.3779,0.79288],[0.37638,0.79288],[0.37481,0.7929],[0.37277,0.79285],[0.37118,0.79287],[0.36959,0.7929],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49676,0.94915],[0.49842,0.94917],[0.48768,0.9001],[0.45477,0.79459],[0.45632,0.79459],[0.45788,0.79459],[0.45944,0.79458],[0.46095,0.7946],[0.46247,0.7946],null,null,null,null,null,null,null,null,null,[0.38097,0.79441],[0.37943,0.79442],[0.3779,0.79442],[0.37638,0.79442],[0.3748,0.79445],[0.37276,0.79439],[0.37118,0.79443],[0.36959,0.79444],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.9476],[0.49842,0.94763],[0.4877,0.90164],[0.45476,0.79305],[0.45631,0.79305],[0.45787,0.79305],[0.45944,0.79304],[0.46094,0.79306],[0.46247,0.79306],null,null,null,null,null,null,null,null,null,[0.38097,0.79595],[0.37943,0.79596],[0.37791,0.79596],[0.36193,0.26951],[0.37479,0.79599],[0.37278,0.79594],[0.37117,0.79597],[0.3696,0.79597],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.94606],[0.49842,0.94608],[0.48771,0.90318],[0.45476,0.79151],[0.45631,0.79151],[0.45786,0.79151],[0.45944,0.7915],[0.46094,0.79152],[0.46246,0.79152],null,null,null,null,null,null,null,null,null,[0.38097,0.79749],[0.37942,0.7975],[0.37788,0.79749],[0.36024,0.26953],[0.37477,0.79752],[0.3728,0.79748],[0.37116,0.79751],[0.36962,0.79751],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.94452],[0.49842,0.94454],[0.48773,0.90473],[0.45475,0.78997],[0.45631,0.78997],[0.45786,0.78997],[0.45944,0.78996],[0.46094,0.78998],[0.46246,0.78999],null,null,null,null,null,null,null,null,null,[0.38096,0.79903],[0.37942,0.79903],[0.50031,0.10155],[0.35854,0.26954],[0.37477,0.79906],[0.37293,0.79901],[0.37115,0.79906],[0.36963,0.79905],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.94297],[0.49843,0.943],[0.48774,0.90627],[0.45475,0.78843],[0.4563,0.78843],[0.45786,0.78843],[0.45944,0.78841],[0.46094,0.78844],[0.46245,0.78845],null,null,null,null,null,null,null,null,null,[0.38096,0.80057],[0.37942,0.80056],[0.37788,0.80055],[0.37632,0.80057],[0.37476,0.80059],[0.37294,0.80055],[0.37114,0.8006],[0.36964,0.80058],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.94143],[0.49843,0.94145],[0.48775,0.90781],[0.45475,0.78689],[0.4563,0.78689],[0.45785,0.78689],[0.45943,0.78688],[0.46095,0.7869],[0.46245,0.78692],null,null,null,null,null,null,null,null,null,[0.38096,0.8021],[0.37942,0.8021],[0.37788,0.80209],[0.37631,0.8021],[0.37475,0.80212],[0.37294,0.80209],[0.37113,0.80214],[0.36966,0.80212],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.93988],[0.49843,0.93991],[0.48777,0.90935],[0.45474,0.78535],[0.45629,0.78535],[0.45785,0.78535],[0.4594,0.78535],[0.46095,0.78535],[0.46245,0.78538],null,null,null,null,null,null,null,null,null,[0.38095,0.80364],[0.37941,0.80364],[0.37787,0.80363],[0.37631,0.80364],[0.37474,0.80365],[0.37295,0.80363],[0.37112,0.80369],[0.36967,0.80365],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.93834],[0.49843,0.93837],[0.48778,0.91089],[0.45474,0.78381],[0.45629,0.78381],[0.45784,0.78381],[0.4594,0.78381],[0.46095,0.78381],[0.46245,0.78384],null,null,null,null,null,null,null,null,null,[0.38094,0.80518],[0.3794,0.80518],[0.37786,0.80518],[0.3763,0.80518],[0.37474,0.80518],[0.37296,0.80516],[0.37111,0.80523],[0.36968,0.80519],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49677,0.9368],[0.49843,0.93682],[0.4878,0.91243],[0.45473,0.78227],[0.45629,0.78227],[0.45784,0.78227],[0.45939,0.78227],[0.46095,0.78227],[0.46245,0.78229],null,null,null,null,null,null,null,null,null,[0.38092,0.80671],[0.37939,0.80672],[0.37785,0.80672],[0.3763,0.80672],[0.37473,0.80672],[0.37297,0.8067],[0.37113,0.80677],[0.3697,0.80673],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49678,0.93525],[0.49843,0.93528],[0.48781,0.91397],[0.45473,0.78073],[0.45628,0.78073],[0.45784,0.78073],[0.45939,0.78073],[0.46095,0.78073],[0.46245,0.78075],null,null,null,null,null,null,null,null,null,[0.38091,0.80826],[0.96199,0.41181],[0.37784,0.80826],[0.3763,0.80826],[0.37473,0.80826],[0.37297,0.80824],[0.37114,0.8083],[0.36971,0.80826],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.49678,0.93371],[0.49843,0.93373],[0.49843,0.93373],[0.45473,0.77919],[0.45628,0.77919],[0.45783,0.77919],[0.45938,0.77919],[0.46095,0.77918],[0.46245,0.77921],null,null,null,null,null,null,null,null,null,[0.16138,0.29892],[0.37936,0.8098],[0.37783,0.8098],[0.37629,0.8098],[0.37474,0.8098],[0.37298,0.80978],[0.37298,0.80978],[0.81121,0.79973],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.18638,0.92192],[0.49843,0.93216],[0.81603,0.90608],[0.45472,0.77765],[0.45627,0.77765],[0.45783,0.77765],[0.45938,0.77765],[0.46095,0.77764],[0.46245,0.77767],null,null,null,null,null,null,null,null,null,[0.38089,0.81134],[0.37935,0.81133],[0.37784,0.81133],[0.37629,0.81133],[0.37476,0.81136],[0.37299,0.81132],[0.80915,0.80073],[0.81121,0.79973],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.3406,0.38355],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.91511,0.08263],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.66724,0.1416],[0.66724,0.1416],[0.66724,0.1416],[0.64452,0.07663],[0.64452,0.07663],[0.18526,0.9197],[0.81553,0.9077],[0.45472,0.77611],[0.45627,0.77611],[0.45782,0.77611],[0.45938,0.77611],[0.46093,0.77611],[0.46246,0.77614],null,null,null,null,null,null,null,null,null,[0.38087,0.81287],[0.37935,0.81286],[0.37785,0.81287],[0.37629,0.81287],[0.37475,0.81288],[0.37298,0.81286],[0.80915,0.80073],[0.81121,0.79973],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.64217,0.82443],[0.64207,0.82281],null,null,null,null,null,null,null,null,null,null,null,null,[0.3406,0.38355],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.78818,0.06528],[0.78818,0.06528],[0.91511,0.08263],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.63157,0.96278],[0.63157,0.96278],[0.66724,0.1416],[0.66724,0.1416],[0.66724,0.1416],[0.64452,0.07663],[0.64452,0.07663],[0.18526,0.9197],[0.45471,0.77457],[0.45471,0.77457],[0.45627,0.77457],[0.45782,0.77457],[0.45937,0.77457],[0.46092,0.77457],[0.46247,0.77462],null,null,null,null,null,null,null,null,null,[0.38085,0.81439],[0.37934,0.81439],[0.37787,0.81441],[0.37629,0.81441],[0.37474,0.81441],[0.37299,0.8144],[0.37299,0.8144],[0.81121,0.79973],[0.81121,0.79973],[0.81121,0.79973],[0.81121,0.79973],[0.81121,0.79973],[0.81121,0.79973],[0.8268,0.64991],null,null,null,null,null,null,null,null,null,null,null,null,[0.64217,0.82443],[0.54829,0.22655],[0.54829,0.22655],[0.54673,0.22672],[0.54517,0.22689],[0.54361,0.22706],[0.54205,0.22723],[0.54049,0.2274],[0.53893,0.22757],[0.53893,0.22757],[0.01749,0.1402],[0.01889,0.1398],[0.0203,0.13942],[0.0203,0.13942],[0.78023,0.30302],[0.18012,0.6888],[0.17851,0.68886],[0.17691,0.68893],[0.17691,0.68893],[0.17691,0.68893],[0.1722,0.68914],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12886,0.69038],[0.12886,0.69038],[0.12886,0.69038],[0.12428,0.69051],[0.12272,0.69052],[0.12115,0.69053],[0.50342,0.24124],[0.50342,0.24124],[0.48885,0.08068],[0.48885,0.08068],[0.48885,0.08068],[0.48885,0.08068],[0.48885,0.08068],[0.0845,0.35949],[0.08606,0.35949],[0.08761,0.35946],[0.08916,0.35943],[0.08916,0.35943],[0.08916,0.35943],[0.08916,0.35943],[0.08916,0.35943],[0.08916,0.35943],[0.35451,0.85288],[0.35302,0.85232],[0.35302,0.85232],[0.35302,0.85232],[0.35302,0.85232],[0.35302,0.85232],[0.35302,0.85232],[0.27886,0.18085],[0.28041,0.18085],[0.28196,0.18084],[0.28351,0.18084],[0.28507,0.18083],[0.28662,0.18083],[0.28662,0.18083],[0.28662,0.18083],[0.28662,0.18083],[0.28662,0.18083],[0.28662,0.18083],[0.31948,0.91236],[0.31948,0.91236],[0.45471,0.77303],[0.45626,0.77303],[0.45781,0.77303],[0.45937,0.77303],[0.46092,0.77303],[0.46249,0.77311],null,null,null,null,null,null,null,null,null,[0.38084,0.81592],[0.37934,0.81592],[0.37788,0.81594],[0.37628,0.81594],[0.37473,0.81595],[0.37305,0.81593],[0.85928,0.62648],[0.85928,0.62648],[0.85928,0.62648],[0.85928,0.62648],[0.85928,0.62648],[0.66958,0.14916],[0.66958,0.14916],[0.55346,0.64315],[0.55352,0.64158],[0.55357,0.64],[0.55364,0.63845],[0.55371,0.6369],[0.55378,0.63536],[0.55385,0.6338],[0.5539,0.63225],[0.55398,0.63071],[0.55406,0.62916],[0.55412,0.62761],[0.33714,0.68741],[0.55425,0.62459],[0.55427,0.62295],[0.55433,0.62145],[0.5544,0.61995],[0.55449,0.6184],[0.55458,0.61683],[0.55468,0.61526],[0.55477,0.61368],[0.55487,0.61211],[0.55483,0.61067],[0.53701,0.22627],[0.01788,0.14175],[0.01926,0.14135],[0.02077,0.141],[0.87398,0.50852],[0.79275,0.73231],[0.17995,0.68724],[0.17837,0.68733],[0.17679,0.6874],[0.17522,0.68744],[0.17368,0.68752],[0.17213,0.68758],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.12887,0.68895],[0.12734,0.68899],[0.12583,0.68904],[0.12431,0.68903],[0.12275,0.68902],[0.12111,0.68905],[0.1195,0.68912],[0.31639,0.66725],[0.31639,0.66725],[0.31639,0.66725],[0.31639,0.66725],[0.65925,0.09585],[0.65925,0.09585],[0.82264,0.36922],[0.59283,0.6208],[0.59284,0.61912],[0.59284,0.61745],[0.59281,0.61581],[0.59279,0.61416],[0.59279,0.61249],[0.59279,0.61082],[0.59278,0.60915],[0.59278,0.6075],[0.59279,0.60596],[0.59281,0.60442],[0.59282,0.60287],[0.59283,0.60133],[0.59284,0.59978],[0.59283,0.59823],[0.59283,0.59667],[0.59282,0.59512],[0.59281,0.59356],[0.59281,0.59201],[0.5928,0.59045],[0.59279,0.5889],[0.59279,0.5889],[0.59279,0.5889],[0.59279,0.5889],[0.59279,0.5889],[0.59279,0.5889],[0.3195,0.91389],[0.3195,0.91389],[0.4547,0.77149],[0.45626,0.77149],[0.45781,0.77149],[0.45936,0.77149],[0.46092,0.77149],[0.46251,0.7716],null,null,null,null,null,null,null,null,null,[0.38084,0.81745],[0.37934,0.81745],[0.37783,0.81747],[0.37626,0.81748],[0.37472,0.81748],[0.37311,0.81746],[0.37311,0.81746],[0.85953,0.62414],[0.66988,0.15477],[0.66949,0.15307],[0.66889,0.15157],[0.56055,0.17263],[0.56063,0.17093],[0.55504,0.64325],[0.5551,0.64167],[0.5551,0.64167],[0.55521,0.63853],[0.55525,0.63697],[0.34296,0.67996],[0.34221,0.68135],[0.34145,0.68269],[0.34068,0.68404],[0.33991,0.68538],[0.33921,0.68675],[0.33851,0.68807],[0.55587,0.62456],[0.55588,0.62302],[0.5559,0.62148],[0.55598,0.61993],[0.55607,0.61837],[0.55615,0.61683],[0.5562,0.61528],[0.55625,0.61373],[0.55631,0.61219],[0.55638,0.61061],[0.55646,0.60903],[0.55646,0.60903],[0.87321,0.51213],[0.87248,0.51045],[0.12321,0.23957],[0.18144,0.68561],[0.17986,0.68575],[0.17829,0.68581],[0.17672,0.68585],[0.17516,0.68589],[0.17361,0.68596],[0.17205,0.686],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1289,0.68749],[0.12737,0.68753],[0.12584,0.68757],[0.12431,0.68756],[0.12279,0.68755],[0.12126,0.68754],[0.11968,0.68752],[0.11799,0.68749],[0.3184,0.66824],[0.31996,0.66787],[0.32158,0.66789],[0.8227,0.36528],[0.82397,0.36749],[0.82414,0.36905],[0.82414,0.36905],[0.82445,0.37204],[0.80704,0.65377],[0.59118,0.61575],[0.59118,0.61408],[0.59117,0.61241],[0.59117,0.61074],[0.59116,0.60908],[0.59117,0.60746],[0.59118,0.60591],[0.59119,0.60437],[0.59121,0.60283],[0.59122,0.60129],[0.59124,0.59975],[0.59125,0.5982],[0.59126,0.59666],[0.59128,0.59512],[0.59129,0.59358],[0.59129,0.59203],[0.59129,0.59047],[0.59128,0.58892],[0.59128,0.58892],[0.59128,0.58892],[0.59128,0.58892],[0.40898,0.2299],[0.10599,0.16235],[0.7846,0.23874],[0.31953,0.91542],[0.4547,0.76995],[0.45625,0.76995],[0.45781,0.76995],[0.45936,0.76995],[0.46091,0.76995],[0.46252,0.77009],null,null,null,null,null,null,null,null,null,[0.38084,0.81745],[0.91578,0.14393],[0.91578,0.14393],[0.91568,0.14224],[0.91547,0.14055],[0.37309,0.81908],[0.27071,0.2603],[0.27075,0.26184],[0.27079,0.26347],[0.27082,0.26502],[0.27084,0.26654],[0.2709,0.2681],[0.56216,0.17088],[0.55642,0.64333],[0.55611,0.64181],[0.55584,0.64029],[0.34586,0.67793],[0.34513,0.67931],[0.3444,0.68068],[0.34367,0.68205],[0.34293,0.68343],[0.3422,0.68479],[0.34143,0.6861],[0.34066,0.68741],[0.33993,0.68877],[0.55746,0.62466],[0.55751,0.62312],[0.55759,0.62157],[0.55765,0.62002],[0.55772,0.61847],[0.55779,0.61691],[0.55788,0.61537],[0.55797,0.61384],[0.55806,0.6123],[0.55806,0.6123],[0.91394,0.42683],[0.91394,0.42683],[0.18625,0.68384],[0.18472,0.68386],[0.18316,0.68388],[0.18316,0.68388],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11808,0.68581],[0.11808,0.68581],[0.11654,0.68587],[0.11502,0.68596],[0.11353,0.68604],[0.11204,0.68614],[0.11061,0.68637],[0.10916,0.68667],[0.10772,0.68703],[0.10628,0.68739],[0.10484,0.68775],[0.1034,0.68815],[0.10197,0.68856],[0.10053,0.68897],[0.0991,0.68938],[0.09768,0.68985],[0.58953,0.60738],[0.58954,0.60583],[0.58956,0.60429],[0.58957,0.60275],[0.58959,0.60121],[0.5896,0.59967],[0.58961,0.59812],[0.58963,0.59658],[0.58964,0.59504],[0.58965,0.59349],[0.58966,0.59195],[0.58967,0.5904],[0.58969,0.58886],[0.79241,0.23708],[0.79241,0.23708],[0.78937,0.23703],[0.78783,0.23702],[0.78627,0.23703],[0.78473,0.23705],[0.31953,0.91695],[0.77206,0.19662],[0.77364,0.1966],[0.77523,0.19658],[0.77681,0.19655],[0.7784,0.1965],[0.77998,0.19646],null,null,null,null,null,null,null,null,null,[0.38091,0.82056],[0.37933,0.82047],[0.3777,0.82041],[0.37621,0.82043],[0.37476,0.82047],[0.37311,0.8206],[0.81619,0.4571],[0.81774,0.45711],[0.81929,0.45712],[0.82084,0.45712],[0.82239,0.45712],[0.82394,0.45713],[0.56371,0.17106],[0.20237,0.58474],[0.55804,0.64147],[0.55774,0.63997],[0.55744,0.63846],[0.55715,0.63695],[0.55685,0.63544],[0.55656,0.6339],[0.55628,0.63235],[0.55607,0.63081],[0.55588,0.62926],[0.55569,0.62772],[0.55533,0.62613],[0.34072,0.69114],[0.33979,0.69269],[0.55916,0.62165],[0.55925,0.6201],[0.55934,0.61856],[0.3308,0.15366],[0.32944,0.15449],[0.32807,0.15532],[0.32686,0.15631],[0.55946,0.61028],[0.55877,0.6087],[0.5581,0.60742],[0.1861,0.68208],[0.18464,0.68222],[0.1831,0.68231],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11804,0.6843],[0.11638,0.68443],[0.11487,0.68452],[0.11337,0.6846],[0.11186,0.68469],[0.11038,0.68481],[0.10882,0.68533],[0.44497,0.13379],[0.68012,0.48833],[0.67857,0.48834],[0.67699,0.48839],[0.67542,0.4884],[0.40968,0.12563],[0.40878,0.12703],[0.58797,0.60928],[0.58792,0.60728],[0.58793,0.60574],[0.58793,0.60422],[0.58793,0.60269],[0.58793,0.60117],[0.58793,0.59964],[0.58793,0.59812],[0.58793,0.5966],[0.58794,0.59507],[0.58794,0.59355],[0.58794,0.59202],[0.58794,0.5905],[0.58805,0.58885],[0.79257,0.23544],[0.79098,0.23544],[0.78938,0.23544],[0.78783,0.23542],[0.78628,0.23541],[0.78475,0.23541],[0.31955,0.91849],[0.77213,0.19809],[0.7737,0.19809],[0.77527,0.19809],[0.77684,0.1981],[0.7784,0.1981],[0.77997,0.1981],null,null,null,null,null,null,null,null,null,[0.38091,0.82208],[0.37936,0.82202],[0.37775,0.82196],[0.37628,0.822],[0.37476,0.82203],[0.37313,0.82212],[0.8162,0.45549],[0.81775,0.45551],[0.8193,0.45552],[0.82085,0.45553],[0.8224,0.45554],[0.82395,0.45555],[0.56527,0.17117],[0.5599,0.64291],[0.55964,0.64138],[0.55935,0.63983],[0.55907,0.63829],[0.55879,0.63674],[0.55851,0.6352],[0.55823,0.63365],[0.55794,0.6321],[0.55766,0.63056],[0.55741,0.62901],[0.55722,0.62747],[0.55697,0.62593],[0.34207,0.69184],[0.34118,0.69332],[0.5606,0.62186],[0.56072,0.62028],[0.0039,0.28519],[0.00302,0.28387],[0.00214,0.28253],[0.32908,0.15667],[0.32775,0.15753],[0.32775,0.15753],[0.82377,0.62351],[0.55956,0.60689],[0.82377,0.62671],[0.1846,0.68071],[0.18297,0.68073],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11798,0.68277],[0.11618,0.683],[0.11467,0.68309],[0.11317,0.68318],[0.11169,0.6833],[0.11025,0.68346],[0.44304,0.13278],[0.44454,0.13227],[0.68007,0.48679],[0.67853,0.48679],[0.67698,0.4868],[0.67544,0.4868],[0.67389,0.4868],[0.67235,0.4868],[0.58647,0.60933],[0.58643,0.60729],[0.58643,0.60575],[0.58643,0.60422],[0.58644,0.60268],[0.58644,0.60116],[0.58644,0.59963],[0.58644,0.59811],[0.58644,0.59658],[0.58644,0.59506],[0.58645,0.59354],[0.58645,0.59201],[0.58645,0.59049],[0.58656,0.58879],[0.79257,0.23388],[0.43161,0.2533],[0.43007,0.25347],[0.78783,0.23383],[0.78632,0.23383],[0.78477,0.23383],[0.31956,0.92001],[0.77213,0.19968],[0.77369,0.1997],[0.77525,0.19972],[0.77682,0.19972],[0.77839,0.19972],[0.77996,0.19973],null,null,null,null,null,null,null,null,null,[0.38091,0.82357],[0.37936,0.82355],[0.37782,0.82352],[0.37628,0.82356],[0.37476,0.82359],[0.37325,0.82368],[0.81621,0.45389],[0.81776,0.4539],[0.81931,0.45392],[0.82086,0.45393],[0.82241,0.45394],[0.9712,0.40341],[0.56684,0.17128],[0.56137,0.64263],[0.56108,0.64106],[0.56077,0.63948],[0.93113,0.7148],[0.56024,0.6364],[0.55999,0.63487],[0.55975,0.63334],[0.5595,0.63181],[0.55925,0.63028],[0.559,0.62875],[0.55875,0.62722],[0.55875,0.62722],[0.34342,0.69255],[0.34253,0.69407],[0.00424,0.28863],[0.00335,0.28731],[0.24169,0.19537],[0.24013,0.1954],[0.23858,0.19544],[0.23706,0.19547],[0.23563,0.19548],[0.82539,0.62189],[0.82539,0.62351],[0.82538,0.62511],[0.8254,0.62676],[0.18453,0.67915],[0.18283,0.67916],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11792,0.68125],[0.11598,0.68158],[0.11448,0.68167],[0.113,0.68179],[0.11156,0.68195],[0.11011,0.68211],[0.68311,0.48524],[0.68158,0.48523],[0.68005,0.48524],[0.6785,0.48522],[0.67697,0.48521],[0.67544,0.48519],[0.67391,0.48518],[0.67238,0.48516],[0.40535,0.12634],[0.58493,0.6073],[0.58494,0.60577],[0.58494,0.60423],[0.58494,0.60269],[0.58495,0.60116],[0.58495,0.59962],[0.58495,0.5981],[0.58495,0.59657],[0.58495,0.59505],[0.58495,0.59353],[0.58496,0.592],[0.58496,0.59048],[0.58507,0.58874],[0.79258,0.23229],[0.79094,0.23227],[0.78946,0.23223],[0.94067,0.40652],[0.78636,0.23226],[0.78478,0.23224],[0.31956,0.92154],[0.77211,0.20128],[0.77369,0.20129],[0.77526,0.20131],[0.77682,0.20133],[0.77837,0.20134],[0.77994,0.20135],null,null,null,null,null,null,null,null,null,[0.38092,0.82509],[0.37937,0.82509],[0.37786,0.82506],[0.37633,0.8251],[0.37479,0.82514],[0.37328,0.82521],[0.81622,0.45229],[0.81777,0.4523],[0.81932,0.45231],[0.82087,0.45232],[0.82239,0.45236],[0.8239,0.45241],[0.56841,0.1714],[0.56285,0.64236],[0.56256,0.64078],[0.92952,0.71678],[0.56202,0.63769],[0.56178,0.63615],[0.56152,0.63462],[0.56127,0.63309],[0.56102,0.63156],[0.56077,0.63002],[0.56053,0.62849],[0.56027,0.62699],[0.55992,0.62559],[0.34477,0.69326],[0.0037,0.29078],[0.00281,0.28945],[0.00191,0.28813],[0.24166,0.19381],[0.24011,0.19384],[0.23861,0.19386],[0.23711,0.19389],[0.23555,0.19391],[0.82702,0.62187],[0.827,0.62351],[0.827,0.62511],[0.827,0.62671],[0.82703,0.62839],[0.18269,0.67759],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.11786,0.67972],[0.11578,0.68015],[0.11431,0.68028],[0.11287,0.68044],[0.11142,0.6806],[0.10998,0.68075],[0.68315,0.48367],[0.68162,0.48366],[0.68008,0.48365],[0.67853,0.48363],[0.67699,0.48361],[0.67545,0.48359],[0.67392,0.48358],[0.67239,0.48356],[0.67083,0.48359],[0.58344,0.60732],[0.58344,0.60578],[0.58345,0.60424],[0.58345,0.60271],[0.58345,0.60117],[0.58345,0.59963],[0.58346,0.5981],[0.58346,0.59656],[0.58346,0.59504],[0.58346,0.59352],[0.58346,0.59199],[0.58347,0.59047],[0.58357,0.5887],[0.79259,0.2307],[0.79097,0.23068],[0.78943,0.23066],[0.78791,0.23068],[0.78636,0.23067],[0.78479,0.23065],[0.31957,0.92308],[0.77209,0.2029],[0.77368,0.20286],[0.77526,0.20289],[0.77683,0.20292],[0.77839,0.20294],[0.77994,0.20295],null,null,null,null,null,null,null,null,null,[0.38091,0.82662],[0.37936,0.82662],[0.37788,0.82659],[0.37637,0.82662],[0.37483,0.82666],[0.3733,0.82674],[0.81623,0.45069],[0.81778,0.4507],[0.81932,0.45072],[0.82083,0.45077],[0.82234,0.45083],[0.82385,0.45088],[0.56997,0.17151],[0.56432,0.64208],[0.56403,0.6405],[0.56379,0.63896],[0.56355,0.63743],[0.59677,0.18558],[0.59522,0.18559],[0.59366,0.18561],[0.59212,0.18563],[0.59058,0.18565],[0.58903,0.18568],[0.58749,0.1857],[0.586,0.18576],[0.346,0.69431],[0.24628,0.19214],[0.00136,0.29026],[0.24318,0.19222],[0.24163,0.19225],[0.24009,0.19227],[0.23859,0.1923],[0.23703,0.19232],[0.23546,0.19234],[0.82863,0.6219],[0.82862,0.6235],[0.82862,0.6251],[0.82862,0.6267],[0.82863,0.62832],[0.29552,0.20766],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.45663,0.74341],[0.11561,0.67876],[0.11418,0.67893],[0.11273,0.67909],[0.11129,0.67924],[0.10984,0.6794],[0.68318,0.48209],[0.68165,0.48209],[0.68011,0.48207],[0.67856,0.48204],[0.67702,0.48202],[0.67547,0.482],[0.67393,0.48198],[0.67239,0.48196],[0.67085,0.48197],[0.58195,0.60733],[0.58195,0.6058],[0.58195,0.60426],[0.58195,0.60272],[0.58196,0.60118],[0.58196,0.59965],[0.58196,0.59811],[0.58197,0.59657],[0.58197,0.59504],[0.58197,0.5935],[0.58197,0.59198],[0.58197,0.59046],[0.58205,0.58868],[0.79251,0.2291],[0.79099,0.22909],[0.78939,0.22908],[0.78788,0.22907],[0.78637,0.22908],[0.78479,0.22906],[0.31959,0.92463],[0.77208,0.20451],[0.77366,0.20448],[0.77524,0.20447],[0.77682,0.2045],[0.7784,0.20453],[0.77995,0.20455],null,null,null,null,null,null,null,null,null,[0.3809,0.82815],[0.37941,0.82817],[0.37795,0.82812],[0.3764,0.82813],[0.37487,0.82818],[0.37487,0.82818],[0.81624,0.44909],[0.81776,0.44913],[0.81927,0.44918],[0.82078,0.44924],[0.82229,0.44929],[0.8238,0.44934],[0.36219,0.82754],[0.56579,0.6418],[0.56555,0.64026],[0.56532,0.63871],[0.56511,0.63713],[0.59673,0.18395],[0.5952,0.18397],[0.59366,0.184],[0.59212,0.18402],[0.59058,0.18405],[0.58905,0.18408],[0.58751,0.1841],[0.58597,0.18413],[0.34732,0.69513],[0.24624,0.19058],[0.2447,0.19062],[0.24315,0.19065],[0.2416,0.19068],[0.24007,0.19071],[0.2385,0.19073],[0.23694,0.19075],[0.23536,0.19079],[0.83025,0.6219],[0.83025,0.6235],[0.83024,0.62509],[0.83024,0.62669],[0.83024,0.62828],[0.29549,0.20934],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.1154,0.67732],[0.11399,0.67751],[0.11257,0.6777],[0.11115,0.67789],[0.10971,0.67805],[0.68322,0.48052],[0.68168,0.4805],[0.68013,0.48048],[0.67859,0.48046],[0.67705,0.48043],[0.6755,0.48041],[0.67396,0.48039],[0.67241,0.48037],[0.67087,0.48035],[0.58045,0.60735],[0.58045,0.60581],[0.58046,0.60427],[0.58046,0.60273],[0.58046,0.6012],[0.58047,0.59966],[0.58047,0.59812],[0.58047,0.59659],[0.58047,0.59505],[0.58048,0.59351],[0.58048,0.59198],[0.58048,0.59045],[0.58053,0.58865],[0.79249,0.22751],[0.791,0.2275],[0.78936,0.2275],[0.95302,0.74648],[0.78635,0.22748],[0.7848,0.22748],[0.31961,0.92617],[0.77206,0.20612],[0.77364,0.20609],[0.77522,0.20606],[0.77681,0.20607],[0.77839,0.20611],[0.77996,0.20614],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[0.29548,0.21095],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"patched":196,"samples":2927};

// Jumping does not bypass the shared horizontal collision rules.
const PLAYER_MOTION=Object.freeze({walkSpeed:2.35,runSpeed:4.2,jumpSeconds:.85,jumpHeight:.85,transitionSeconds:.55});
function templeJumpHeight(progress){const p=Math.max(0,Math.min(1,progress));return 4*PLAYER_MOTION.jumpHeight*p*(1-p);}
function templeRestFits(x,z,yaw,kind,nav){
 const base=nav.templeGroundHeight(x,z),length=kind==='lie'?1.85:.35;
 if(!Number.isFinite(base))return false;
 for(let along=-length;along<=.36;along+=.18)for(const side of[-.32,0,.32]){
  const px=x+Math.cos(yaw)*side+Math.sin(yaw)*along,pz=z-Math.sin(yaw)*side+Math.cos(yaw)*along;
  if(!nav.templeCanStand(px,pz)||Math.abs(nav.templeGroundHeight(px,pz)-base)>.18)return false;
 }
 return true;
}

// A single continuous triangulated heightfield: visual terrain and walking agree.
const islandLandscape={version:'coastal-meadow-2',seaY:-22.8,x0:-220,z0:-120,step:2,columns:221,rows:251};
// Terrain is immutable. Reuse sampled grid heights for grass and collision
// queries instead of repeating the same trigonometry for every footstep.
const islandHeightCache=new Float32Array(islandLandscape.columns*islandLandscape.rows).fill(NaN);
function islandGridHeight(ix,iz){const g=islandLandscape,index=iz*g.columns+ix;let h=islandHeightCache[index];if(Number.isNaN(h)){h=islandVertexHeight(g.x0+ix*g.step,g.z0+iz*g.step);islandHeightCache[index]=h;}return h;}
const islandSmooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function islandRadius(x,z){const a=Math.atan2((z-125)/210,x/180);return Math.hypot(x/180,(z-125)/210)/(1+.035*Math.sin(a*3+.4)+.022*Math.sin(a*5-1.2));}
function islandVertexHeight(x,z){
 const r=islandRadius(x,z),phase=z*.033-.7;
 // Fill the hollow on the way from the halls to the south beach. Its two
 // crests have equal height and zero slope, so the join stays smooth.
 const meadowHeight=phase>=Math.PI/2&&phase<=5*Math.PI/2?1:Math.sin(phase);
 const roll=1.5*Math.sin(x*.026+z*.009)+1.2*meadowHeight+.6*Math.cos(x*.061-z*.018);
 let y=-8+roll;
 y=y*(1-islandSmooth(.67,.84,r))+(-17.5)*islandSmooth(.67,.84,r);
 y=y*(1-islandSmooth(.81,1.06,r))+(-25.5)*islandSmooth(.81,1.06,r);
 const dx=Math.max(0,Math.abs(x)-60),dz=Math.max(0,Math.abs(z-1)-28),plateau=1-islandSmooth(0,35,Math.hypot(dx,dz));
 return Math.fround(y*(1-plateau)-.16*plateau);
}
function islandHeight(x,z){
 const g=islandLandscape,fx=(x-g.x0)/g.step,fz=(z-g.z0)/g.step,ix=Math.floor(fx),iz=Math.floor(fz);
 if(ix<0||iz<0||ix>=g.columns-1||iz>=g.rows-1)return NaN;
 const u=fx-ix,v=fz-iz,a=islandGridHeight(ix,iz),b=islandGridHeight(ix+1,iz),c=islandGridHeight(ix+1,iz+1),d=islandGridHeight(ix,iz+1);
 return u>=v?a*(1-u)+b*(u-v)+c*v:a*(1-v)+c*u+d*(v-u);
}
const islandTrees=[];
let islandSeed=90317;const islandRandom=()=>((islandSeed=Math.imul(islandSeed,1664525)+1013904223>>>0)/4294967296);
for(let i=0;i<85;i++){
 const x=-145+islandRandom()*290,z=-38+islandRandom()*325,r=islandRadius(x,z);
 if(r>.76||Math.abs(x)<70&&z<65||Math.abs(x)<15&&z>240||[[-105,135],[99,135]].some(p=>Math.hypot(x-p[0],z-p[1])<10))continue;
 islandTrees.push({id:'coastal-tree-'+i,x,z,radius:.5,height:4.8+islandRandom()*3,seed:islandRandom()});
}
function islandCanStand(x,z){return [[0,0],[-.34,0],[.34,0],[0,-.34],[0,.34]].every(([dx,dz])=>{const h=islandHeight(x+dx,z+dz);return Number.isFinite(h)&&h>islandLandscape.seaY+.15;});}

// Garden additions are expressed as world-space support triangles. Browser and
// authoritative movement consume the same faces; original assets stay intact.
const templeGardenLayout={
 version:'A01-R2-built-garden',radius:.34,
 seatSize:{width:.80,depth:.74,height:.42,backWidth:.83,backDepth:.06,backZ:-.39,backHeight:.42,backY:.67},
 pads:[{id:'east',x:99,z:135,kind:'tea',title:'观湖茶歇'},{id:'west',x:-105,z:135,kind:'read',title:'竹影静读'},{id:'sea',x:0,z:264,kind:'tea',title:'听海小憩'}],
 seats:[
  {id:'garden-east-west',room:'garden',position:[97.94,.42,135],seatHeight:.42,yaw:Math.PI/2,action:'tea',approach:[97.94,136.45],exit:[97.94,136.45]},
  {id:'garden-east-east',room:'garden',position:[100.06,.42,135],seatHeight:.42,yaw:-Math.PI/2,action:'tea',approach:[100.06,136.45],exit:[100.06,136.45]},
  {id:'garden-west-north',room:'garden',position:[-105,.42,134.25],seatHeight:.42,yaw:Math.PI/2,action:'read',approach:[-106.4,134.25],exit:[-106.4,134.25]},
  {id:'garden-west-south',room:'garden',position:[-105,.42,135.75],seatHeight:.42,yaw:Math.PI/2,action:'read',approach:[-106.4,135.75],exit:[-106.4,135.75]},
  {id:'garden-sea-left',room:'garden',position:[-.75,.42,264],seatHeight:.42,yaw:0,action:'tea',approach:[-.75,262.6],exit:[-.75,262.6]},
  {id:'garden-sea-right',room:'garden',position:[.75,.42,264],seatHeight:.42,yaw:0,action:'tea',approach:[.75,262.6],exit:[.75,262.6]}
 ],
 westTrail:[],bridge:[],edgewalk:[],
 tableObstacles:[{x:99,z:135,hx:.7,hz:.4,label:'观湖茶桌'},{x:0,z:264.8,hx:1.1,hz:.45,label:'听海茶桌'}]
};
templeGardenLayout.seatObstacles=templeGardenLayout.seats.map(s=>{const q=templeGardenLayout.seatSize,loZ=q.backZ-q.backDepth/2,hiZ=q.depth/2,localZ=(loZ+hiZ)/2,hz=(hiZ-loZ)/2,hx=Math.max(q.width,q.backWidth)/2,c=Math.cos(s.yaw),n=Math.sin(s.yaw);return{x:s.position[0]+n*localZ,z:s.position[2]+c*localZ,hx:Math.abs(c)*hx+Math.abs(n)*hz,hz:Math.abs(n)*hx+Math.abs(c)*hz,seatId:s.id,label:'静修园坐席'};});
// Old raised trails and bridges are retired; open meadow supports walking.
// Original terrain supports these six trunks. Share the exact centres and
// radii with the visible planting so both clients and the server block them.
templeGardenLayout.treeObstacles=templeGardenLayout.pads.flatMap(pad=>[-1,1].map(side=>({id:'garden-tree-'+pad.id+'-'+(side<0?'west':'east'),padId:pad.id,x:pad.x+side*4.1,z:pad.z-2.6,radius:.09,height:1.4,label:'静修点花木树干'})));
function quad(id,v,extra={}){return{id,vertices:v,indices:[0,3,2,0,2,1],...extra};}
function gardenSurfaces(terrainHeight){
 const result=[];
 for(const pad of templeGardenLayout.pads){
  const heights=[];for(let x=-2;x<=2;x+=.5)for(let z=-2;z<=2;z+=.5){const y=terrainHeight(pad.x+x,pad.z+z);if(Number.isFinite(y))heights.push(y);}
  if(heights.length<60)throw Error('Garden pad lacks measured terrain support: '+pad.id);
  const top=Math.max(...heights)+.055;
  result.push(quad('garden-pad-'+pad.id,[[pad.x-2,top,pad.z-2],[pad.x+2,top,pad.z-2],[pad.x+2,top,pad.z+2],[pad.x-2,top,pad.z+2]],{kind:'garden-pad',padId:pad.id,topY:top}));
  const inner=[[-2,-2],[2,-2],[2,2],[-2,2]],outer=[[-3,-3],[3,-3],[3,3],[-3,3]];
  for(let i=0;i<4;i++){const j=(i+1)%4,outerY=k=>{const h=terrainHeight(pad.x+outer[k][0],pad.z+outer[k][1]);if(!Number.isFinite(h))throw Error('Garden pad approach lacks support');return h+.025;};
   result.push(quad('garden-pad-slope-'+pad.id+'-'+i,[[pad.x+inner[i][0],top,pad.z+inner[i][1]],[pad.x+inner[j][0],top,pad.z+inner[j][1]],[pad.x+outer[j][0],outerY(j),pad.z+outer[j][1]],[pad.x+outer[i][0],outerY(i),pad.z+outer[i][1]]],{kind:'garden-pad-slope'}));}
 }
 // All garden surfaces are static quadrilaterals. Store a conservative bound once
 // so distant player and grass queries skip every triangle without allocations.
 for(const s of result){
  const xs=s.vertices.map(v=>v[0]),zs=s.vertices.map(v=>v[2]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  const pad=1e-6*Math.max(1,maxX-minX,maxZ-minZ);
  s.groundBounds=[minX-pad,maxX+pad,minZ-pad,maxZ+pad];
 }
 return result;
}
function gardenHeight(x,z,surfaces){
 let height=-Infinity;
 for(const surface of surfaces){
  const bounds=surface.groundBounds;
  if(bounds&&(x<bounds[0]||x>bounds[1]||z<bounds[2]||z>bounds[3]))continue;
  const ids=surface.indices,vtx=surface.vertices;
  for(let i=0;i<ids.length;i+=3){const a=vtx[ids[i]],b=vtx[ids[i+1]],c=vtx[ids[i+2]],den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-10)continue;
  const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,w=1-u-v;if(Math.min(u,v,w)>=-1e-7)height=Math.max(height,u*a[1]+v*b[1]+w*c[1]);}
 }
 return Number.isFinite(height)?height:NaN;
}
function gardenCanStand(x,z,surfaces){return [[0,0],[-.36,0],[.36,0],[0,-.36],[0,.36]].every(([a,b])=>Number.isFinite(gardenHeight(x+a,z+b,surfaces)));}

// The two pavilions, thresholds, furniture and paths use one shared world datum.
function applySideHalls(L){
 L.version='2.6.0-ground-actions';L.design.revision='R8-original-stone-repair';
 L.sideHalls=[[-1,'scripture','藏经阁'],[1,'tea','暴富']].map(([side,id,label])=>({side,id,label,x:side*44,z:14.4,scale:.5,ceilingY:7.58,bounds:[side*44-10,side*44+10,6.625,21.6],door:{x:side*44,z:21.6,width:4.8,height:4},shift:[side*28.15,5.8]}));
 const moved=new WeakSet();
 for(const h of L.sideHalls){
  const [dx,dz]=h.shift;
  const move=p=>{if(p&&!moved.has(p)){p[0]+=dx;p[p.length===3?2:1]+=dz;moved.add(p);}};
  for(const list of[L.seats,L.design.seats])for(const s of list)if(s.room===h.id){move(s.position);move(s.approach);move(s.exit);const b=s.bodyEnvelope?.boundsXZ;if(b&&!moved.has(b)){b[0]+=dx;b[1]+=dx;b[2]+=dz;b[3]+=dz;moved.add(b);}}
  for(const f of L.design.furniture)if((h.id==='scripture'&&/^(reading|library|scripture)/.test(f.id))||(h.id==='tea'&&/^tea-/.test(f.id)))move(f.position);
  for(const list of[L.rooms,L.design.regions]){const r=list.find(r=>r.id===h.id);Object.assign(r,{label:h.label,bounds:[...h.bounds],width:20,depth:14.975,grossArea:299.5});}
 }
 L.zones=[{id:'hall',bounds:[-19.6,19.6,-4.08,14.3]},...L.sideHalls.flatMap(h=>[{id:h.id,bounds:[h.bounds[0]+.3,h.bounds[1]-.3,h.bounds[2]+.3,h.bounds[3]-.3]},{id:h.id,bounds:[h.x-2.05,h.x+2.05,21.25,22.1]}])];
 for(const list of[L.openings,L.design.openings])for(const h of L.sideHalls){
  const prefix=h.side<0?'west':'east';
  const front=list.find(o=>o.id===prefix+'-foyer-link');Object.assign(front,{centre:[h.x,0,21.6],axis:'z',clearWidth:4.8,clearHeight:4,thresholdY:0,sign:{text:h.label,bottomY:4.3,topY:4.85}});
  const link=list.find(o=>o.id===prefix+'-main-link');Object.assign(link,{centre:[h.side*22,0,24],axis:'x',role:'open-forecourt',clearWidth:3.2,clearHeight:4.4,thresholdY:0});
 }
 L.pathfinding={minX:-58,maxX:58,minZ:-4.1,maxZ:25.8,step:.25};
 L.design.scope='Main hall, library and tea pavilions connected by an open level stone forecourt; the low front gallery has been removed.';
 L.approvals.layout={status:'approved',by:'user',instruction:'按图生成两个小殿，把藏经阁和茶室挪到旁边两个小殿',drawing:'user-three-halls-reference',date:'2026-11-06'};
 // The original crown reaches the rear coffer at this height. The longer
 // plinth supports the enlarged base and the offerings sit clear in front.
 L.props={caishen:{position:[44,.35,9.4],height:6.94,plinth:{size:[4.8,.35,4.48],position:[44,.175,9.4]}},wishingTree:{position:[44,0,-12],height:22,collisionRadius:5.5},burner:{height:1.24},oilLamps:{height:1.55}};
 L.props.wealthOfferingTable={position:[44,0,12.42],size:[5.55,.92,1.24]};
 L.props.wealthBurner={position:[44,L.props.wealthOfferingTable.size[1],12.42],height:.56,approach:[44,13.57]};
 // Keep worshippers on interspersed cushions on both sides of the central aisle.
 const occupied=new Set(['mat-0','mat-4','mat-7','mat-9','mat-11','mat-13','mat-16','mat-18','mat-21']);
 for(const mat of L.mats)mat.npc=occupied.has(mat.id);
 // The wealth pavilion is now dedicated to prayer. Reading-room tea remains.
 L.seats=L.seats.filter(s=>s.room!=='tea');L.design.seats=L.design.seats.filter(s=>s.room!=='tea');
 L.design.furniture=L.design.furniture.filter(f=>f.room!=='tea'&&f.type!=='scripture-bookcase');
 const library=L.sideHalls.find(h=>h.id==='scripture'),[la,lb,lc,ld]=library.bounds;
 const tableX={'reading-table':library.x-5.4,'library-tea-table':library.x+5.5};
 const offsets=new Map();
 for(const table of L.design.furniture.filter(f=>Object.hasOwn(tableX,f.id))){
  offsets.set(table.id,tableX[table.id]-table.position[0]);table.position[0]=tableX[table.id];
 }
 const shifted=new WeakSet();
 function shiftX(points,offset,indices){
  if(!points||shifted.has(points))return;
  shifted.add(points);for(const index of indices)points[index]+=offset;
 }
 for(const seat of [...L.seats,...L.design.seats].filter(s=>s.room==='scripture')){
  const offset=offsets.get(seat.tableId);if(!offset)continue;
  for(const points of [seat.position,seat.approach,seat.exit])shiftX(points,offset,[0]);
  shiftX(seat.bodyEnvelope?.boundsXZ,offset,[0,1]);
 }
 for(const shelf of[
  {id:'scripture-west-to-ceiling',position:[la+.66,0,(lc+.15+ld-.55)/2],size:[1.08,7.30,ld-lc-.7],front:'+X'},
  {id:'scripture-east-to-ceiling',position:[lb-.66,0,(lc+.15+ld-.55)/2],size:[1.08,7.30,ld-lc-.7],front:'-X'},
  {id:'scripture-rear-to-ceiling',position:[library.x,0,lc+.69],size:[lb-la-2.4,7.30,1.08],front:'+Z'}
 ])L.design.furniture.push({...shelf,type:'scripture-bookcase',room:'scripture',clickableBookSpines:true});
 for(let i=0;i<3;i++)L.mats.push({id:'wealth-mat-'+i,x:41.7+i*2.3,z:14.15,npc:false,room:'tea'});
 // Source stone is retired below these measured, solid replacement plinths.
 // Every tread is also the actual navigation surface, on client and server.
 L.foundations=[{id:'main',x:0,z:0,scale:1},...L.sideHalls.map(h=>({id:h.id,x:h.x,z:h.z,scale:h.scale}))].map(h=>({...h,top:1.45*h.scale,cutoff:2.18*h.scale,doorHalf:5.32*h.scale}));
}
const inRecess=(h,x,z)=>h.recesses?.some(([minX,maxX,minZ,maxZ])=>x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ);
function foundationSurfaces(L){
 const f=STONE_FOUNDATION,vertices=[],uv=[],indices=[],mainIndices=[];
 for(let j=0;j<f.rows;j++)for(let i=0;i<f.cols;i++){const k=j*f.cols+i;vertices.push([f.minX+i*f.step,f.heights[k]??0,f.minZ+j*f.step]);uv.push(...(f.uv[k]||[0,0]));}
 for(let j=0;j<f.rows-1;j++)for(let i=0;i<f.cols-1;i++){
  const a=j*f.cols+i,b=a+1,c=a+f.cols+1,d=a+f.cols;
  if([a,b,c,d].some(k=>f.heights[k]===null))continue;
  indices.push(a,d,c,a,c,b);
  const x=f.minX+(i+.5)*f.step,z=f.minZ+(j+.5)*f.step;
  if(!inRecess(L.foundations[0],x,z))mainIndices.push(a,d,c,a,c,b);
 }
 return L.foundations.map(h=>({id:'foundation-'+h.id+'-original-repair',thickness:5,originalStone:true,backingHeight:1.15*h.scale,uv,vertices:vertices.map(([x,y,z])=>[h.x+x*h.scale,y*h.scale,h.z+z*h.scale]),indices:h.recesses?mainIndices:indices,recesses:h.recesses}));
}
function sourceFoundationHeight(L,x,z){
 const f=STONE_FOUNDATION;
 for(const h of L.foundations){const px=((x-h.x)/h.scale-f.minX)/f.step,pz=((z-h.z)/h.scale-f.minZ)/f.step,i=Math.floor(px),j=Math.floor(pz);
  if(i<0||j<0||i>=f.cols-1||j>=f.rows-1||inRecess(h,x,z))continue;
  const k=j*f.cols+i,[a,b,c,d]=[f.heights[k],f.heights[k+1],f.heights[k+f.cols+1],f.heights[k+f.cols]];
  if([a,b,c,d].some(y=>y===null))continue;
  const u=px-i,v=pz-j;return (u>v?a+(b-a)*u+(c-b)*v:a+(d-a)*v+(c-d)*u)*h.scale;
 }return NaN;
}
function sideHallSurfaces(L){
 const result=[],rect=(id,a,b,c,d,y=0,thickness=5)=>result.push({id,thickness,vertices:[[a,y,c],[b,y,c],[b,y,d],[a,y,d]],indices:[0,3,2,0,2,1]});
 for(const h of L.sideHalls){
  const [a,b,c,d]=h.bounds;
  rect('court-'+h.id+'-west',h.x-11.5,a,5.7,25.9);
  rect('court-'+h.id+'-east',b,h.x+11.5,5.7,25.9);
  rect('court-'+h.id+'-rear',a,b,5.7,c);
  rect('court-'+h.id+'-front',a,b,d,25.9);
  const c0=21.9,c1=25.9,w=z=>8.2-(z-19)/7*1.2,outer=h.x-h.side*11.5;
  const left0=h.side<0?outer:w(c0),right0=h.side<0?-w(c0):outer,left1=h.side<0?outer:w(c1),right1=h.side<0?-w(c1):outer;
  result.push({id:'court-'+h.id+'-link',thickness:5,vertices:[[left0,0,c0],[right0,0,c0],[right1,0,c1],[left1,0,c1]],indices:[0,3,2,0,2,1]});
 }
 return result;
}

const templeSceneLayout={
  "version": "2.2-front-corner-rooms",
  "floorY": 0,
  "assetOffsetY": 3.2,
  "character": {
    "radius": 0.34,
    "height": 1.7,
    "groundInset": 0.012,
    "maxStep": 0.3,
    "travelSample": 0.15
  },
  "spawn": {
    "x": 0,
    "z": 12.7,
    "yaw": 3.141592653589793
  },
  "camera": {
    "eyeHeight": 1.6,
    "targetHeight": 1.15,
    "distance": 7.4,
    "padding": 0.22,
    "fov": 65,
    "pitch": 0.08,
    "hallTargetHeight": 2.7
  },
  "zones": [
    {
      "id": "hall",
      "bounds": [
        -19.6,
        19.6,
        -4.08,
        2.74
      ]
    },
    {
      "id": "hall",
      "bounds": [
        -10.52,
        10.52,
        2.74,
        13.66
      ]
    },
    {
      "id": "foyer",
      "bounds": [
        -19.6,
        19.6,
        13.66,
        14.3
      ]
    },
    {
      "id": "scripture",
      "bounds": [
        -19.6,
        -11.46,
        3.66,
        12.74
      ]
    },
    {
      "id": "tea",
      "bounds": [
        11.46,
        19.6,
        3.66,
        12.74
      ]
    },
    {
      "id": "door",
      "bounds": [
        -11.46,
        -10.52,
        8.55,
        10.85
      ]
    },
    {
      "id": "door",
      "bounds": [
        10.52,
        11.46,
        8.55,
        10.85
      ]
    },
    {
      "id": "door",
      "bounds": [
        -17.009999999999998,
        -14.69,
        12.74,
        13.66
      ]
    },
    {
      "id": "door",
      "bounds": [
        14.69,
        17.009999999999998,
        12.74,
        13.66
      ]
    }
  ],
  "openings": [
    {
      "id": "main-entry",
      "from": "exterior",
      "to": "foyer",
      "kind": "door",
      "centre": [
        0,
        0,
        15.2
      ],
      "clearWidth": 9.6,
      "clearHeight": 8,
      "thresholdY": 0,
      "note": "Opening remains within existing door-free portal; final top profile must follow original eave and facade geometry."
    },
    {
      "id": "foyer-hall",
      "from": "foyer",
      "to": "prayer-hall",
      "kind": "open-hall",
      "centre": [
        0,
        0,
        13.2
      ],
      "clearWidth": 22,
      "clearHeight": 15.5,
      "thresholdY": 0
    },
    {
      "id": "west-main-link",
      "from": "prayer-hall",
      "to": "scripture",
      "kind": "door",
      "centre": [
        -11,
        0,
        9.7
      ],
      "clearWidth": 3,
      "clearHeight": 3.7,
      "thresholdY": 0,
      "role": "side-connecting-door",
      "label": "藏经室侧通门"
    },
    {
      "id": "east-main-link",
      "from": "prayer-hall",
      "to": "tea",
      "kind": "door",
      "centre": [
        11,
        0,
        9.7
      ],
      "clearWidth": 3,
      "clearHeight": 3.7,
      "thresholdY": 0,
      "role": "side-connecting-door",
      "label": "茶室侧通门"
    },
    {
      "id": "west-foyer-link",
      "from": "foyer",
      "to": "scripture",
      "kind": "door",
      "centre": [
        -15.85,
        0,
        13.2
      ],
      "clearWidth": 3,
      "clearHeight": 3.7,
      "thresholdY": 0,
      "role": "room-main-entrance",
      "label": "藏经室正门",
      "frontFace": "+Z",
      "opensToward": "foyer",
      "alwaysOpen": true,
      "frame": {
        "material": "暗朱红木",
        "jambWidth": 0.22,
        "lintelThickness": 0.24,
        "overallWidth": 3.44,
        "overallHeight": 3.94
      },
      "sign": {
        "text": "藏经室",
        "bottomY": 4.08,
        "topY": 4.55
      },
      "foyerClearZone": [
        -17.35,
        -14.35,
        13.2,
        14.7
      ],
      "innerClearZone": [
        -17.35,
        -14.35,
        11.7,
        13.2
      ],
      "note": "用户手绘前角房间；朝前廊的常开正门，零高差门槛。"
    },
    {
      "id": "east-foyer-link",
      "from": "foyer",
      "to": "tea",
      "kind": "door",
      "centre": [
        15.85,
        0,
        13.2
      ],
      "clearWidth": 3,
      "clearHeight": 3.7,
      "thresholdY": 0,
      "role": "room-main-entrance",
      "label": "茶室正门",
      "frontFace": "+Z",
      "opensToward": "foyer",
      "alwaysOpen": true,
      "frame": {
        "material": "暗朱红木",
        "jambWidth": 0.22,
        "lintelThickness": 0.24,
        "overallWidth": 3.44,
        "overallHeight": 3.94
      },
      "sign": {
        "text": "茶室",
        "bottomY": 4.08,
        "topY": 4.55
      },
      "foyerClearZone": [
        14.35,
        17.35,
        13.2,
        14.7
      ],
      "innerClearZone": [
        14.35,
        17.35,
        11.7,
        13.2
      ],
      "note": "用户手绘前角房间；朝前廊的常开正门，零高差门槛。"
    }
  ],
  "entrance": [
    {
      "z": 9,
      "halfWidth": 5.3,
      "walkHalfWidth": 4.8
    },
    {
      "z": 15.2,
      "halfWidth": 5.3,
      "walkHalfWidth": 4.8
    },
    {
      "z": 16.6,
      "halfWidth": 5.3,
      "walkHalfWidth": 4.8
    },
    {
      "z": 17.4,
      "halfWidth": 8.2,
      "walkHalfWidth": 7.7
    },
    {
      "z": 19,
      "halfWidth": 8.2,
      "walkHalfWidth": 7.7
    },
    {
      "z": 26,
      "halfWidth": 7,
      "walkHalfWidth": 6.5
    }
  ],
  "ramp": {
    "startZ": 26,
    "endZ": 85,
    "halfWidth": 7,
    "walkHalfWidth": 6.5,
    "endY": -11.05,
    "stairs": {
      "flights": [
        [
          26,
          40,
          20
        ],
        [
          44,
          58,
          20
        ],
        [
          62,
          84.5,
          35
        ]
      ],
      "restLandings": [
        [
          40,
          44
        ],
        [
          58,
          62
        ]
      ],
      "bottomLanding": [
        84.5,
        86
      ]
    }
  },
  "connector": {
    "minX": 0,
    "maxX": 80,
    "minZ": 74,
    "maxZ": 86,
    "walkMinZ": 76,
    "walkMaxZ": 84,
    "startBlendX": 7,
    "segments": 40
  },
  "sceneryReserve": {
    "halfWidth": 30.5,
    "maxZ": 28.5
  },
  "timberFloors": [
    {
      "id": "Rear inner temple timber floor",
      "bounds": [
        -20.7,
        20.7,
        -15.8,
        -10
      ]
    },
    {
      "id": "Front inner temple timber floor",
      "bounds": [
        -20.7,
        20.7,
        11,
        15.2
      ]
    },
    {
      "id": "Rear side passage timber floor -1",
      "bounds": [
        -20.7,
        -7.9,
        -10,
        -5.6
      ]
    },
    {
      "id": "Rear side passage timber floor 1",
      "bounds": [
        7.9,
        20.7,
        -10,
        -5.6
      ]
    },
    {
      "id": "Front side passage timber floor -1",
      "bounds": [
        -20.7,
        -7.9,
        6.6,
        11
      ]
    },
    {
      "id": "Front side passage timber floor 1",
      "bounds": [
        7.9,
        20.7,
        6.6,
        11
      ]
    },
    {
      "id": "Outer side passage timber floor -1",
      "bounds": [
        -20.7,
        -15.12,
        -5.6,
        6.6
      ]
    },
    {
      "id": "Outer side passage timber floor 1",
      "bounds": [
        15.12,
        20.7,
        -5.6,
        6.6
      ]
    }
  ],
  "anchors": {
    "woodfish": [
      8.8,
      -2.7
    ],
    "incense": [
      0,
      -3
    ],
    "statues": [
      [
        -13.2,
        -10.7
      ],
      [
        0,
        -10.7
      ],
      [
        13.2,
        -10.7
      ]
    ]
  },
  "localPreview": {
    "port": 8780,
    "label": "静修园 · 侧房可互动"
  },
  "design": {
    "schema": "quiet-temple-design.proposal.v1",
    "version": "A-01-R3",
    "status": "IMPLEMENTED_LOCAL_REVIEW",
    "units": "metres",
    "axis": {
      "x": "right",
      "y": "up",
      "z": "toward-front-entry"
    },
    "scope": "Implemented local candidate following the user sketch; geometry and gameplay evidence are recorded separately. No public deployment.",
    "baseline": "work/quiet-temple-v2",
    "areaBasis": {
      "envelope": [
        -20.7,
        20.7,
        -15.8,
        15.2
      ],
      "width": 41.4,
      "depth": 31,
      "grossArea": 1283.4,
      "definition": "Floor envelope / gross zoning area, including wall feet. It is not net usable floor area. Deduct existing shell wall intrusions, new partitions, columns and furnishings separately.",
      "measuredSideWallInnerX": {
        "left": -20.38,
        "right": 20.48
      },
      "sideWallMeasurementsPreliminary": true
    },
    "regions": [
      {
        "id": "sanctuary",
        "label": "通宽三像圣坛",
        "bounds": [
          -20.7,
          20.7,
          -15.8,
          -4.5
        ],
        "width": 41.4,
        "depth": 11.3,
        "grossArea": 467.82
      },
      {
        "id": "prayer-hall",
        "label": "通宽后部礼拜区",
        "bounds": [
          -20.7,
          20.7,
          -4.5,
          3.2
        ],
        "width": 41.4,
        "depth": 7.7,
        "grossArea": 318.78
      },
      {
        "id": "central-aisle",
        "label": "中央礼拜与通道",
        "bounds": [
          -11,
          11,
          3.2,
          13.2
        ],
        "width": 22,
        "depth": 10,
        "grossArea": 220
      },
      {
        "id": "scripture",
        "label": "藏经室",
        "bounds": [
          -20.7,
          -11,
          3.2,
          13.2
        ],
        "width": 9.7,
        "depth": 10,
        "grossArea": 97
      },
      {
        "id": "tea",
        "label": "静修茶室",
        "bounds": [
          11,
          20.7,
          3.2,
          13.2
        ],
        "width": 9.7,
        "depth": 10,
        "grossArea": 97
      },
      {
        "id": "foyer",
        "label": "两米前廊",
        "bounds": [
          -20.7,
          20.7,
          13.2,
          15.2
        ],
        "width": 41.4,
        "depth": 2,
        "grossArea": 82.8
      }
    ],
    "areaSchedule": {
      "sanctuary": 467.82,
      "prayerHall": 330,
      "mainHallCombined": 797.82,
      "scripture": 145.5,
      "tea": 145.5,
      "foyer": 194.58,
      "total": 1283.4
    },
    "partitions": {
      "thickness": 0.24,
      "centreLines": [
        {
          "id": "west-room-wall",
          "axis": "x",
          "value": -11,
          "range": [
            -4.5,
            10.5
          ]
        },
        {
          "id": "east-room-wall",
          "axis": "x",
          "value": 11,
          "range": [
            -4.5,
            10.5
          ]
        },
        {
          "id": "room-rear-walls",
          "axis": "z",
          "value": -4.5,
          "ranges": [
            [
              -20.7,
              -11
            ],
            [
              11,
              20.7
            ]
          ]
        },
        {
          "id": "room-front-walls",
          "axis": "z",
          "value": 10.5,
          "ranges": [
            [
              -20.7,
              -11
            ],
            [
              11,
              20.7
            ]
          ]
        }
      ],
      "note": "Gross region boundaries are partition centre-lines; finished clear dimensions are smaller. Current outer shell inner wall x about −20.38 and +20.48."
    },
    "openings": [
      {
        "id": "main-entry",
        "from": "exterior",
        "to": "foyer",
        "kind": "door",
        "centre": [
          0,
          0,
          15.2
        ],
        "clearWidth": 9.6,
        "clearHeight": 8,
        "thresholdY": 0,
        "note": "Opening remains within existing door-free portal; final top profile must follow original eave and facade geometry."
      },
      {
        "id": "foyer-hall",
        "from": "foyer",
        "to": "prayer-hall",
        "kind": "open-hall",
        "centre": [
          0,
          0,
          13.2
        ],
        "clearWidth": 22,
        "clearHeight": 15.5,
        "thresholdY": 0
      },
      {
        "id": "west-main-link",
        "from": "prayer-hall",
        "to": "scripture",
        "kind": "door",
        "centre": [
          -11,
          0,
          9.7
        ],
        "clearWidth": 3,
        "clearHeight": 3.7,
        "thresholdY": 0,
        "role": "side-connecting-door",
        "label": "藏经室侧通门"
      },
      {
        "id": "east-main-link",
        "from": "prayer-hall",
        "to": "tea",
        "kind": "door",
        "centre": [
          11,
          0,
          9.7
        ],
        "clearWidth": 3,
        "clearHeight": 3.7,
        "thresholdY": 0,
        "role": "side-connecting-door",
        "label": "茶室侧通门"
      },
      {
        "id": "west-foyer-link",
        "from": "foyer",
        "to": "scripture",
        "kind": "door",
        "centre": [
          -15.85,
          0,
          13.2
        ],
        "clearWidth": 3,
        "clearHeight": 3.7,
        "thresholdY": 0,
        "role": "room-main-entrance",
        "label": "藏经室正门",
        "frontFace": "+Z",
        "opensToward": "foyer",
        "alwaysOpen": true,
        "frame": {
          "material": "暗朱红木",
          "jambWidth": 0.22,
          "lintelThickness": 0.24,
          "overallWidth": 3.44,
          "overallHeight": 3.94
        },
        "sign": {
          "text": "藏经室",
          "bottomY": 4.08,
          "topY": 4.55
        },
        "foyerClearZone": [
          -17.35,
          -14.35,
          13.2,
          14.7
        ],
        "innerClearZone": [
          -17.35,
          -14.35,
          11.7,
          13.2
        ],
        "note": "用户手绘前角房间；朝前廊的常开正门，零高差门槛。"
      },
      {
        "id": "east-foyer-link",
        "from": "foyer",
        "to": "tea",
        "kind": "door",
        "centre": [
          15.85,
          0,
          13.2
        ],
        "clearWidth": 3,
        "clearHeight": 3.7,
        "thresholdY": 0,
        "role": "room-main-entrance",
        "label": "茶室正门",
        "frontFace": "+Z",
        "opensToward": "foyer",
        "alwaysOpen": true,
        "frame": {
          "material": "暗朱红木",
          "jambWidth": 0.22,
          "lintelThickness": 0.24,
          "overallWidth": 3.44,
          "overallHeight": 3.94
        },
        "sign": {
          "text": "茶室",
          "bottomY": 4.08,
          "topY": 4.55
        },
        "foyerClearZone": [
          14.35,
          17.35,
          13.2,
          14.7
        ],
        "innerClearZone": [
          14.35,
          17.35,
          11.7,
          13.2
        ],
        "note": "用户手绘前角房间；朝前廊的常开正门，零高差门槛。"
      }
    ],
    "heightScheme": {
      "datumY": 0,
      "measuredShell": {
        "overallHighestY": 35.9403,
        "centralRoofUndersideApprox": [
          22.5,
          23.14
        ],
        "rearSlopeAtStatueHeadZApprox": 17.106,
        "sideCorridorRoofApprox": 16.7,
        "entranceEaveApprox": 16.44,
        "note": "Shell roof shape varies by x/z. The highest ridge is not a room clear height. Longitudinal and transverse profiles must follow actual roof-statue-clearance.json samples, not a generic gable."
      },
      "mainHall": {
        "ceiling": "New timber inner roof follows the original compound sloped roof profile",
        "centralFinishUndersideUpToY": 22,
        "sideFinishUndersideTargetY": 16,
        "notUniform": true,
        "sourceProfile": "roof-statue-clearance.json",
        "lowestProposedMainPendantY": 9.2,
        "structuralConnection": "visible timber frame/column connections and attached roof lining; no unsupported flat 7 m false roof"
      },
      "sideRooms": {
        "ceilingFinishUndersideY": 6.6,
        "lowestBeamUndersideY": 6.2,
        "lowestPendantY": 3.2,
        "lintelUndersideY": 3.7,
        "structuralConnection": "Local timber coffers visibly supported by wall beams and corner posts; upper volume separated from main hall roof"
      },
      "foyer": {
        "ceiling": "Follow original entrance eave/roof, not a low flat cap",
        "lowestPendantY": 5.4
      },
      "statueSampling": {
        "centralHeight": 15,
        "centralTopY": 16.2,
        "centralVertexRoofMinimumGap": 0.983,
        "centralEnvelopeFlatTopRoofMinimumGap": 0.323,
        "method": "Actual scaled mesh vertex and bounding envelope vertical roof samples; not full triangle BVH"
      },
      "status": "Design targets are subject to evaluated silhouette / support clearance against actual shell before implementation"
    },
    "altar": {
      "region": "sanctuary",
      "platform": {
        "boundsXZ": [
          -19.3,
          19.3,
          -15.4,
          -5.4
        ],
        "topY": 1.2
      },
      "statues": [
        {
          "id": "crowned-left",
          "asset": "left-altar-statue",
          "position": [
            -13.2,
            1.2,
            -10.7
          ],
          "height": 13.5,
          "width": 9.0815,
          "depth": 7.6517,
          "uniformScale": 4.352320950177604,
          "baseY": 1.2,
          "topY": 14.7,
          "semanticFront": "+Z",
          "attachmentFace": "bottom",
          "boundsXZ": [
            -17.7395,
            -8.658,
            -14.5197,
            -6.868
          ],
          "status": "proposed; evaluated vertex sampling against actual shell passed per roof-statue-clearance.json, full BVH/runtime camera review remains required"
        },
        {
          "id": "buddha-centre",
          "asset": "buddha-statue",
          "position": [
            0,
            1.2,
            -10.7
          ],
          "height": 15,
          "width": 10.5611,
          "depth": 8.0034,
          "uniformScale": 3.749251413358737,
          "baseY": 1.2,
          "topY": 16.2,
          "semanticFront": "+Z",
          "attachmentFace": "bottom",
          "boundsXZ": [
            -5.2812,
            5.2799,
            -14.6969,
            -6.6935
          ],
          "status": "proposed; evaluated vertex sampling against actual shell passed per roof-statue-clearance.json, full BVH/runtime camera review remains required"
        },
        {
          "id": "guanyin-right",
          "asset": "guanyin-statue",
          "position": [
            13.2,
            1.2,
            -10.7
          ],
          "height": 13.5,
          "width": 8.1037,
          "depth": 7.1668,
          "uniformScale": 4.354600899925134,
          "baseY": 1.2,
          "topY": 14.7,
          "semanticFront": "+Z",
          "attachmentFace": "bottom",
          "boundsXZ": [
            9.1481,
            17.2518,
            -14.2834,
            -7.1166
          ],
          "status": "proposed; evaluated vertex sampling against actual shell passed per roof-statue-clearance.json, full BVH/runtime camera review remains required"
        }
      ],
      "frontOfferingTable": {
        "position": [
          0,
          0,
          -4.1
        ],
        "size": [
          15.5,
          1.15,
          0.75
        ]
      },
      "sanctuaryAccess": "Statue plinth is not player circulation; front access remains in prayer hall"
    },
    "furniture": [
      {
        "id": "reading-table",
        "type": "timber-reading-table",
        "room": "scripture",
        "position": [
          -16.5,
          0,
          6.9
        ],
        "size": [
          3.2,
          0.74,
          1.3
        ],
        "undersideY": 0.68,
        "source": "same table/leg construction family as existing world.js; proposed dimensions"
      },
      {
        "id": "library-tea-table",
        "type": "timber-tea-table",
        "room": "scripture",
        "position": [
          -16.5,
          0,
          11
        ],
        "size": [
          1.7,
          0.7,
          1
        ],
        "undersideY": 0.64,
        "source": "existing timber/bronze/ceramic family"
      },
      {
        "id": "tea-table-0",
        "type": "low-timber-tea-table",
        "room": "tea",
        "position": [
          17,
          0,
          6.6
        ],
        "size": [
          2.2,
          0.55,
          1.3
        ],
        "undersideY": 0.48,
        "source": "existing tea-table construction and celadon cup assets"
      },
      {
        "id": "tea-table-1",
        "type": "low-timber-tea-table",
        "room": "tea",
        "position": [
          17,
          0,
          11
        ],
        "size": [
          2.2,
          0.55,
          1.3
        ],
        "undersideY": 0.48,
        "source": "existing tea-table construction and celadon cup assets"
      },
      {
        "id": "scripture-west-shelf-0",
        "type": "scripture-bookcase",
        "room": "scripture",
        "position": [
          -19.72,
          0,
          5.2
        ],
        "size": [
          0.55,
          2.5,
          2.8
        ],
        "front": "+X",
        "clickableBookSpines": true,
        "standingApproach": [
          -19.04,
          5.199999999999999
        ]
      },
      {
        "id": "scripture-west-shelf-1",
        "type": "scripture-bookcase",
        "room": "scripture",
        "position": [
          -19.72,
          0,
          8.3
        ],
        "size": [
          0.55,
          2.5,
          2.8
        ],
        "front": "+X",
        "clickableBookSpines": true,
        "standingApproach": [
          -19.04,
          8.3
        ]
      },
      {
        "id": "scripture-west-shelf-2",
        "type": "scripture-bookcase",
        "room": "scripture",
        "position": [
          -19.72,
          0,
          11.4
        ],
        "size": [
          0.55,
          2.5,
          2.8
        ],
        "front": "+X",
        "clickableBookSpines": true,
        "standingApproach": [
          -19.04,
          11.4
        ]
      },
      {
        "id": "scripture-rear-shelf",
        "type": "scripture-bookcase",
        "room": "scripture",
        "position": [
          -16.2,
          0,
          3.73
        ],
        "size": [
          6.8,
          2.5,
          0.55
        ],
        "front": "+Z",
        "clickableBookSpines": true,
        "standingApproach": [
          -16.2,
          4.800000000000001
        ]
      },
      {
        "id": "tea-cabinet",
        "type": "tea-ceramic-cabinet",
        "room": "tea",
        "position": [
          17,
          0,
          3.75
        ],
        "size": [
          5.5,
          1.75,
          0.55
        ],
        "front": "+Z"
      },
      {
        "id": "incense",
        "type": "existing-incense-burner",
        "room": "prayer-hall",
        "position": [
          0,
          0,
          -3
        ],
        "size": [
          1,
          1,
          1
        ],
        "approach": [
          0,
          -1.6
        ],
        "actionEnvelope": [
          -1,
          1,
          -2.4,
          -0.8
        ]
      },
      {
        "id": "woodfish",
        "type": "existing-woodfish-and-stand",
        "room": "prayer-hall",
        "position": [
          8.8,
          0,
          -2.7
        ],
        "size": [
          1,
          0.9,
          1
        ],
        "approach": [
          8.8,
          -1.4
        ],
        "actionEnvelope": [
          8,
          9.6,
          -2.1,
          -0.7
        ]
      }
    ],
    "seats": [
      {
        "id": "read-front-0",
        "room": "scripture",
        "position": [
          -17.5,
          0.42,
          7.9
        ],
        "yaw": 3.141592653589793,
        "action": "read",
        "approach": [
          -17.5,
          9.350000000000001
        ],
        "exit": [
          -17.5,
          9.350000000000001
        ],
        "tableId": "reading-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -18.15,
            -16.85,
            7.25,
            8.55
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "open-book",
          "read",
          "turn-page",
          "close-book",
          "stand"
        ]
      },
      {
        "id": "read-back-0",
        "room": "scripture",
        "position": [
          -17.5,
          0.42,
          5.9
        ],
        "yaw": 0,
        "action": "read",
        "approach": [
          -17.5,
          4.45
        ],
        "exit": [
          -17.5,
          4.45
        ],
        "tableId": "reading-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -18.15,
            -16.85,
            5.25,
            6.550000000000001
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "open-book",
          "read",
          "turn-page",
          "close-book",
          "stand"
        ]
      },
      {
        "id": "read-front-1",
        "room": "scripture",
        "position": [
          -15.5,
          0.42,
          7.9
        ],
        "yaw": 3.141592653589793,
        "action": "read",
        "approach": [
          -15.5,
          9.350000000000001
        ],
        "exit": [
          -15.5,
          9.350000000000001
        ],
        "tableId": "reading-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -16.15,
            -14.85,
            7.25,
            8.55
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "open-book",
          "read",
          "turn-page",
          "close-book",
          "stand"
        ]
      },
      {
        "id": "read-back-1",
        "room": "scripture",
        "position": [
          -15.5,
          0.42,
          5.9
        ],
        "yaw": 0,
        "action": "read",
        "approach": [
          -15.5,
          4.45
        ],
        "exit": [
          -15.5,
          4.45
        ],
        "tableId": "reading-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -16.15,
            -14.85,
            5.25,
            6.550000000000001
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "open-book",
          "read",
          "turn-page",
          "close-book",
          "stand"
        ]
      },
      {
        "id": "library-tea-west",
        "room": "scripture",
        "position": [
          -17.71,
          0.42,
          11
        ],
        "yaw": 1.5707963267948966,
        "action": "tea",
        "approach": [
          -18.96,
          11
        ],
        "exit": [
          -18.96,
          11
        ],
        "tableId": "library-tea-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -18.36,
            -17.060000000000002,
            10.35,
            11.65
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "library-tea-east",
        "room": "scripture",
        "position": [
          -15.29,
          0.42,
          11
        ],
        "yaw": -1.5707963267948966,
        "action": "tea",
        "approach": [
          -13.79,
          11
        ],
        "exit": [
          -13.79,
          11
        ],
        "tableId": "library-tea-table",
        "seatHeight": 0.42,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.42,
        "bodyEnvelope": {
          "boundsXZ": [
            -15.94,
            -14.639999999999999,
            10.35,
            11.65
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-0-west",
        "room": "tea",
        "position": [
          15.54,
          0.16,
          6.6
        ],
        "yaw": 1.5707963267948966,
        "action": "tea",
        "approach": [
          14.04,
          6.6
        ],
        "exit": [
          14.04,
          6.6
        ],
        "tableId": "tea-table-0",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            14.889999999999999,
            16.189999999999998,
            5.949999999999999,
            7.249999999999999
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-0-east",
        "room": "tea",
        "position": [
          18.46,
          0.16,
          6.6
        ],
        "yaw": -1.5707963267948966,
        "action": "tea",
        "approach": [
          19.56,
          6.6
        ],
        "exit": [
          19.56,
          6.6
        ],
        "tableId": "tea-table-0",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            17.810000000000002,
            19.11,
            5.949999999999999,
            7.249999999999999
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-0-rear",
        "room": "tea",
        "position": [
          17,
          0.16,
          5.6
        ],
        "yaw": 0,
        "action": "tea",
        "approach": [
          17,
          4.45
        ],
        "exit": [
          17,
          4.45
        ],
        "tableId": "tea-table-0",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            16.35,
            17.65,
            4.949999999999999,
            6.249999999999999
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-1-west",
        "room": "tea",
        "position": [
          15.54,
          0.16,
          11
        ],
        "yaw": 1.5707963267948966,
        "action": "tea",
        "approach": [
          14.04,
          11
        ],
        "exit": [
          14.04,
          11
        ],
        "tableId": "tea-table-1",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            14.889999999999999,
            16.189999999999998,
            10.35,
            11.65
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-1-east",
        "room": "tea",
        "position": [
          18.46,
          0.16,
          11
        ],
        "yaw": -1.5707963267948966,
        "action": "tea",
        "approach": [
          19.56,
          11
        ],
        "exit": [
          19.56,
          11
        ],
        "tableId": "tea-table-1",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            17.810000000000002,
            19.11,
            10.35,
            11.65
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      },
      {
        "id": "tea-1-rear",
        "room": "tea",
        "position": [
          17,
          0.16,
          10
        ],
        "yaw": 0,
        "action": "tea",
        "approach": [
          17,
          8.55
        ],
        "exit": [
          17,
          8.55
        ],
        "tableId": "tea-table-1",
        "seatHeight": 0.16,
        "actorRootY": 0,
        "seatedBodyPivotY": 0.16,
        "bodyEnvelope": {
          "boundsXZ": [
            16.35,
            17.65,
            9.35,
            10.65
          ],
          "minY": 0,
          "maxY": 1.95
        },
        "navigation": {
          "reserveBeforeApproach": true,
          "entryFromApproach": true,
          "releaseOnStand": true
        },
        "animation": [
          "walk-to-seat",
          "turn",
          "sit",
          "reach-cup",
          "lift-cup",
          "sip",
          "lower-cup",
          "return-cup",
          "stand"
        ]
      }
    ],
    "mats": [
      {
        "id": "mat-0",
        "position": [
          -7.8,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-1",
        "position": [
          -5.4,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-2",
        "position": [
          -3,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-3",
        "position": [
          3,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-4",
        "position": [
          5.4,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-5",
        "position": [
          7.8,
          0.045,
          0
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-6",
        "position": [
          -7.8,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-7",
        "position": [
          -5.4,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-8",
        "position": [
          -3,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-9",
        "position": [
          3,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-10",
        "position": [
          5.4,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-11",
        "position": [
          7.8,
          0.045,
          2.8
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-12",
        "position": [
          -7.8,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-13",
        "position": [
          -5.4,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-14",
        "position": [
          -3,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-15",
        "position": [
          3,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-16",
        "position": [
          5.4,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-17",
        "position": [
          7.8,
          0.045,
          5.6
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-18",
        "position": [
          -7.8,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-19",
        "position": [
          -5.4,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-20",
        "position": [
          -3,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-21",
        "position": [
          3,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-22",
        "position": [
          5.4,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      },
      {
        "id": "mat-23",
        "position": [
          7.8,
          0.045,
          8.4
        ],
        "size": [
          1.4,
          0.12,
          1.5
        ],
        "facing": "-Z"
      }
    ],
    "routes": [
      {
        "id": "central-arrival",
        "label": "主入口至佛前中央通道",
        "polyline": [
          [
            0,
            15.2
          ],
          [
            0,
            10.5
          ],
          [
            0,
            -0.5
          ]
        ],
        "clearWidth": 3
      },
      {
        "id": "front-cross",
        "label": "前厅横向通道",
        "polyline": [
          [
            -19,
            12.7
          ],
          [
            19,
            12.7
          ]
        ],
        "clearWidth": 2.2
      },
      {
        "id": "left-room-lane",
        "label": "藏经室东侧主通道",
        "polyline": [
          [
            -12.5,
            9.4
          ],
          [
            -12.5,
            -2.5
          ]
        ],
        "clearWidth": 2
      },
      {
        "id": "right-room-lane",
        "label": "茶室西侧主通道",
        "polyline": [
          [
            12.5,
            9.4
          ],
          [
            12.5,
            -2.5
          ]
        ],
        "clearWidth": 2
      },
      {
        "id": "left-room-link",
        "label": "主殿至藏经室",
        "polyline": [
          [
            -9.7,
            5.6
          ],
          [
            -12.5,
            5.6
          ]
        ],
        "clearWidth": 2.2
      },
      {
        "id": "right-room-link",
        "label": "主殿至茶室",
        "polyline": [
          [
            9.7,
            5.6
          ],
          [
            12.5,
            5.6
          ]
        ],
        "clearWidth": 2.2
      },
      {
        "id": "west-main-entrance-route",
        "label": "藏经室正门至房内主通道",
        "polyline": [
          [
            -15.85,
            12
          ],
          [
            -15.85,
            9.2
          ],
          [
            -12.5,
            9.2
          ]
        ],
        "clearWidth": 2
      },
      {
        "id": "east-main-entrance-route",
        "label": "茶室正门至房内主通道",
        "polyline": [
          [
            15.85,
            12
          ],
          [
            15.85,
            9.2
          ],
          [
            12.5,
            9.2
          ]
        ],
        "clearWidth": 2
      }
    ],
    "interactionDesign": {
      "scripture": {
        "shelf": "Approach a highlighted book, click it or press E; open a random classical text page with title, chapter and source attribution.",
        "seatedRead": "Approach a reading seat, reserve it, walk into alignment, sit, open book in both hands. Page UI can choose another random text or close; standing returns to a validated exit point.",
        "libraryTea": "Two library rest seats also support lifting a cup and drinking tea."
      },
      "tea": {
        "loop": "Walk to a free tea seat, sit on cushion, reach cup at table edge, lift to mouth, sip, lower and replace on table; stand on command.",
        "cupContact": "Cup attaches to hand during lift and returns to its own table anchor; avoid showing a duplicate held and table cup."
      },
      "stateControl": {
        "seatReservation": "One player per seat, shared room occupancy visible; release on stand/disconnect.",
        "movement": "Movement locked only while seated or page dialog is open; exit route remains clear.",
        "camera": "Camera reserve, furniture clearance and hand/book/cup envelopes checked independently from floor area.",
        "points": "Reading and tea do not implicitly award merit; any new rewards need a separate explicit design."
      }
    },
    "humanEnvelope": {
      "standingHeight": 1.8,
      "bodyRadius": 0.34,
      "seatedActionPlan": [
        1.3,
        1.3
      ],
      "benchSeatY": 0.42,
      "cushionSeatY": 0.16,
      "readingTableTopY": 0.74,
      "readingTableUndersideY": 0.68,
      "kneeTargetTopY": 0.6,
      "lowTeaTableTopY": 0.55,
      "lowTeaTableUndersideY": 0.48,
      "crossLeggedKneeTopY": 0.42,
      "bookCupTopReserveY": 1.95,
      "minimumRoomMainLaneWidth": 2
    },
    "finishes": {
      "timber": "深胡桃木",
      "columns": "暗朱红",
      "metal": "旧金",
      "walls": "暖米白",
      "ceramics": "青瓷",
      "lighting": "Warm restrained focal light; clear faces and garments, no blown gold"
    },
    "approvals": {
      "layout": "pending",
      "section": "pending",
      "furniture": "pending",
      "runtime": "not-started-for-new-proposal"
    },
    "remainingChecks": [
      "Full triangle BVH and runtime camera check after scaled statue vertex roof sampling",
      "Existing shell pillars against proposed doors and routes",
      "Partition and ceiling support evaluation",
      "Camera and garment motion for each seat",
      "Source-verified public-domain scripture selection",
      "Player approval of dimensioned plan and section before construction"
    ],
    "revision": "R3-user-front-corner-rooms",
    "userSketch": "codex-clipboard-2480d431-3ca1-4f13-9a30-6fa6b3440ff8.jpg",
    "runtimeClearance": {
      "sideLiningInnerX": 20,
      "navigationSideLimit": 19.6,
      "characterRadius": 0.34,
      "comment": "Gross architectural dimensions retained; interior finish and avatar circulation inset to measured shell."
    }
  },
  "seats": [
    {
      "id": "read-front-0",
      "room": "scripture",
      "position": [
        -17.5,
        0.42,
        7.9
      ],
      "yaw": 3.141592653589793,
      "action": "read",
      "approach": [
        -17.5,
        9.350000000000001
      ],
      "exit": [
        -17.5,
        9.350000000000001
      ],
      "tableId": "reading-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -18.15,
          -16.85,
          7.25,
          8.55
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "open-book",
        "read",
        "turn-page",
        "close-book",
        "stand"
      ]
    },
    {
      "id": "read-back-0",
      "room": "scripture",
      "position": [
        -17.5,
        0.42,
        5.9
      ],
      "yaw": 0,
      "action": "read",
      "approach": [
        -17.5,
        4.45
      ],
      "exit": [
        -17.5,
        4.45
      ],
      "tableId": "reading-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -18.15,
          -16.85,
          5.25,
          6.550000000000001
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "open-book",
        "read",
        "turn-page",
        "close-book",
        "stand"
      ]
    },
    {
      "id": "read-front-1",
      "room": "scripture",
      "position": [
        -15.5,
        0.42,
        7.9
      ],
      "yaw": 3.141592653589793,
      "action": "read",
      "approach": [
        -15.5,
        9.350000000000001
      ],
      "exit": [
        -15.5,
        9.350000000000001
      ],
      "tableId": "reading-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -16.15,
          -14.85,
          7.25,
          8.55
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "open-book",
        "read",
        "turn-page",
        "close-book",
        "stand"
      ]
    },
    {
      "id": "read-back-1",
      "room": "scripture",
      "position": [
        -15.5,
        0.42,
        5.9
      ],
      "yaw": 0,
      "action": "read",
      "approach": [
        -15.5,
        4.45
      ],
      "exit": [
        -15.5,
        4.45
      ],
      "tableId": "reading-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -16.15,
          -14.85,
          5.25,
          6.550000000000001
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "open-book",
        "read",
        "turn-page",
        "close-book",
        "stand"
      ]
    },
    {
      "id": "library-tea-west",
      "room": "scripture",
      "position": [
        -17.71,
        0.42,
        11
      ],
      "yaw": 1.5707963267948966,
      "action": "tea",
      "approach": [
        -18.96,
        11
      ],
      "exit": [
        -18.96,
        11
      ],
      "tableId": "library-tea-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -18.36,
          -17.060000000000002,
          10.35,
          11.65
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "library-tea-east",
      "room": "scripture",
      "position": [
        -15.29,
        0.42,
        11
      ],
      "yaw": -1.5707963267948966,
      "action": "tea",
      "approach": [
        -13.79,
        11
      ],
      "exit": [
        -13.79,
        11
      ],
      "tableId": "library-tea-table",
      "seatHeight": 0.42,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.42,
      "bodyEnvelope": {
        "boundsXZ": [
          -15.94,
          -14.639999999999999,
          10.35,
          11.65
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-0-west",
      "room": "tea",
      "position": [
        15.54,
        0.16,
        6.6
      ],
      "yaw": 1.5707963267948966,
      "action": "tea",
      "approach": [
        14.04,
        6.6
      ],
      "exit": [
        14.04,
        6.6
      ],
      "tableId": "tea-table-0",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          14.889999999999999,
          16.189999999999998,
          5.949999999999999,
          7.249999999999999
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-0-east",
      "room": "tea",
      "position": [
        18.46,
        0.16,
        6.6
      ],
      "yaw": -1.5707963267948966,
      "action": "tea",
      "approach": [
        19.56,
        6.6
      ],
      "exit": [
        19.56,
        6.6
      ],
      "tableId": "tea-table-0",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          17.810000000000002,
          19.11,
          5.949999999999999,
          7.249999999999999
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-0-rear",
      "room": "tea",
      "position": [
        17,
        0.16,
        5.6
      ],
      "yaw": 0,
      "action": "tea",
      "approach": [
        17,
        4.45
      ],
      "exit": [
        17,
        4.45
      ],
      "tableId": "tea-table-0",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          16.35,
          17.65,
          4.949999999999999,
          6.249999999999999
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-1-west",
      "room": "tea",
      "position": [
        15.54,
        0.16,
        11
      ],
      "yaw": 1.5707963267948966,
      "action": "tea",
      "approach": [
        14.04,
        11
      ],
      "exit": [
        14.04,
        11
      ],
      "tableId": "tea-table-1",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          14.889999999999999,
          16.189999999999998,
          10.35,
          11.65
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-1-east",
      "room": "tea",
      "position": [
        18.46,
        0.16,
        11
      ],
      "yaw": -1.5707963267948966,
      "action": "tea",
      "approach": [
        19.56,
        11
      ],
      "exit": [
        19.56,
        11
      ],
      "tableId": "tea-table-1",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          17.810000000000002,
          19.11,
          10.35,
          11.65
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    },
    {
      "id": "tea-1-rear",
      "room": "tea",
      "position": [
        17,
        0.16,
        10
      ],
      "yaw": 0,
      "action": "tea",
      "approach": [
        17,
        8.55
      ],
      "exit": [
        17,
        8.55
      ],
      "tableId": "tea-table-1",
      "seatHeight": 0.16,
      "actorRootY": 0,
      "seatedBodyPivotY": 0.16,
      "bodyEnvelope": {
        "boundsXZ": [
          16.35,
          17.65,
          9.35,
          10.65
        ],
        "minY": 0,
        "maxY": 1.95
      },
      "navigation": {
        "reserveBeforeApproach": true,
        "entryFromApproach": true,
        "releaseOnStand": true
      },
      "animation": [
        "walk-to-seat",
        "turn",
        "sit",
        "reach-cup",
        "lift-cup",
        "sip",
        "lower-cup",
        "return-cup",
        "stand"
      ]
    }
  ],
  "mats": [
    {
      "id": "mat-0",
      "x": -7.8,
      "z": 0,
      "npc": true
    },
    {
      "id": "mat-1",
      "x": -5.4,
      "z": 0,
      "npc": false
    },
    {
      "id": "mat-2",
      "x": -3,
      "z": 0,
      "npc": true
    },
    {
      "id": "mat-3",
      "x": 3,
      "z": 0,
      "npc": false
    },
    {
      "id": "mat-4",
      "x": 5.4,
      "z": 0,
      "npc": false
    },
    {
      "id": "mat-5",
      "x": 7.8,
      "z": 0,
      "npc": false
    },
    {
      "id": "mat-6",
      "x": -7.8,
      "z": 2.8,
      "npc": true
    },
    {
      "id": "mat-7",
      "x": -5.4,
      "z": 2.8,
      "npc": false
    },
    {
      "id": "mat-8",
      "x": -3,
      "z": 2.8,
      "npc": true
    },
    {
      "id": "mat-9",
      "x": 3,
      "z": 2.8,
      "npc": false
    },
    {
      "id": "mat-10",
      "x": 5.4,
      "z": 2.8,
      "npc": false
    },
    {
      "id": "mat-11",
      "x": 7.8,
      "z": 2.8,
      "npc": false
    },
    {
      "id": "mat-12",
      "x": -7.8,
      "z": 5.6,
      "npc": true
    },
    {
      "id": "mat-13",
      "x": -5.4,
      "z": 5.6,
      "npc": false
    },
    {
      "id": "mat-14",
      "x": -3,
      "z": 5.6,
      "npc": true
    },
    {
      "id": "mat-15",
      "x": 3,
      "z": 5.6,
      "npc": false
    },
    {
      "id": "mat-16",
      "x": 5.4,
      "z": 5.6,
      "npc": false
    },
    {
      "id": "mat-17",
      "x": 7.8,
      "z": 5.6,
      "npc": false
    },
    {
      "id": "mat-18",
      "x": -7.8,
      "z": 8.4,
      "npc": true
    },
    {
      "id": "mat-19",
      "x": -5.4,
      "z": 8.4,
      "npc": false
    },
    {
      "id": "mat-20",
      "x": -3,
      "z": 8.4,
      "npc": true
    },
    {
      "id": "mat-21",
      "x": 3,
      "z": 8.4,
      "npc": false
    },
    {
      "id": "mat-22",
      "x": 5.4,
      "z": 8.4,
      "npc": false
    },
    {
      "id": "mat-23",
      "x": 7.8,
      "z": 8.4,
      "npc": false
    }
  ],
  "rooms": [
    {
      "id": "sanctuary",
      "label": "通宽三像圣坛",
      "bounds": [
        -20.7,
        20.7,
        -15.8,
        -4.5
      ],
      "width": 41.4,
      "depth": 11.3,
      "grossArea": 467.82
    },
    {
      "id": "prayer-hall",
      "label": "通宽后部礼拜区",
      "bounds": [
        -20.7,
        20.7,
        -4.5,
        3.2
      ],
      "width": 41.4,
      "depth": 7.7,
      "grossArea": 318.78
    },
    {
      "id": "central-aisle",
      "label": "中央礼拜与通道",
      "bounds": [
        -11,
        11,
        3.2,
        13.2
      ],
      "width": 22,
      "depth": 10,
      "grossArea": 220
    },
    {
      "id": "scripture",
      "label": "藏经室",
      "bounds": [
        -20.7,
        -11,
        3.2,
        13.2
      ],
      "width": 9.7,
      "depth": 10,
      "grossArea": 97
    },
    {
      "id": "tea",
      "label": "静修茶室",
      "bounds": [
        11,
        20.7,
        3.2,
        13.2
      ],
      "width": 9.7,
      "depth": 10,
      "grossArea": 97
    },
    {
      "id": "foyer",
      "label": "两米前廊",
      "bounds": [
        -20.7,
        20.7,
        13.2,
        15.2
      ],
      "width": 41.4,
      "depth": 2,
      "grossArea": 82.8
    }
  ],
  "rituals": {
    "incense": {
      "x": 0,
      "z": -2.12,
      "burner": {
        "x": 0,
        "y": 0.98,
        "z": -3
      }
    },
    "woodfish": {
      "x": 8.8,
      "z": -1.8,
      "target": {
        "x": 8.8,
        "y": 0.83,
        "z": -2.7
      }
    }
  },
  "pathfinding": {
    "minX": -20.1,
    "maxX": 20.1,
    "minZ": -4.1,
    "maxZ": 14.3,
    "step": 0.25
  },
  "approvals": {
    "layout": {
      "status": "approved",
      "by": "user",
      "instruction": "开始执行方案; 用户手绘前角房间; 内墙顶完整且不穿庙壳",
      "date": "2026-11-04",
      "drawing": "A01-R3-user-sketch"
    },
    "runtime": {
      "status": "pending"
    }
  }
};
applySideHalls(templeSceneLayout);
templeSceneLayout.seats=[...templeSceneLayout.seats,...templeGardenLayout.seats];
// The photo-marked stone drums straddle the outer edges of the entry stairs.
const drumSupport={innerX:6.72,outerX:9.2,backZ:16.8,frontZ:19.2};
const mainDoor=templeSceneLayout.openings.find(opening=>opening.id==='main-entry');
const drumModelHeight=1.379;
const drumFaceScale=mainDoor.clearHeight*.30/drumModelHeight;
templeSceneLayout.entryDrums={
 sites:[[-7.87,17.82],[7.87,17.82]],
 bottom:templeSceneLayout.floorY-templeSceneLayout.character.groundInset,
 scale:[drumFaceScale,drumFaceScale,1.70],width:1.10,depth:.74,height:drumModelHeight,support:drumSupport
};
// The paving fits into two shallow recesses in the original side plinth.
// Align these bounds with the sampled stone foundation grid.
const {outerX,backZ,frontZ}=drumSupport;
templeSceneLayout.foundations[0].recesses=[[-outerX,-8,backZ,frontZ],[8,outerX,backZ,frontZ]];
function templeEntranceWidth(z,key='halfWidth'){
 const s=templeSceneLayout.entrance;for(let i=1;i<s.length;i++)if(z<=s[i].z){const a=s[i-1],b=s[i],t=Math.max(0,(z-a.z)/(b.z-a.z));return a[key]+(b[key]-a[key])*t;}return s.at(-1)[key];
}
function templeApproachSections(){
 const L=templeSceneLayout,r=L.ramp,p=r.stairs,result=[],rise=(r.endY-L.floorY)/p.flights.reduce((sum,f)=>sum+f[2],0);let completed=0;
 for(let flight=0;flight<p.flights.length;flight++){
  const[a,b,count]=p.flights[flight];
  // Renderer positions use Float32: share those exact tread boundaries so a
  // rounded edge cannot leave navigation standing one riser above the mesh.
  for(let step=0;step<count;step++)result.push({id:'flight-'+(flight+1)+'-tread-'+(step+1),kind:'stair-tread',z0:Math.fround(a+(b-a)*step/count),z1:Math.fround(a+(b-a)*(step+1)/count),y:L.floorY+(completed+step)*rise});
  completed+=count;
  if(flight<p.restLandings.length){const[z0,z1]=p.restLandings[flight];result.push({id:'rest-'+(flight+1),kind:'rest-landing',z0,z1,y:L.floorY+completed*rise});}
 }
 result.push({id:'bottom',kind:'bottom-landing',z0:p.bottomLanding[0],z1:p.bottomLanding[1],y:r.endY});return result;
}
function templeApproachProfileHeight(z){
 const L=templeSceneLayout;if(z<=L.ramp.startZ)return L.floorY;
 for(const s of templeApproachSections())if(z<=s.z1)return s.y;return L.ramp.endY;
}
function templeStructureSurfaces(terrainHeight){
 const L=templeSceneLayout,surfaces=[];
 const quad=(id,a,b,c,d)=>surfaces.push({id,vertices:[a,b,c,d],indices:[0,3,2,0,2,1]});
 const entrySections=L.entrance.filter(s=>s.z>=15.2);
 for(let i=1;i<entrySections.length;i++){const a=entrySections[i-1],b=entrySections[i];quad('entry-'+i,[-a.halfWidth,L.floorY,a.z],[a.halfWidth,L.floorY,a.z],[b.halfWidth,L.floorY,b.z],[-b.halfWidth,L.floorY,b.z]);}
 const {innerX,outerX,backZ,frontZ}=L.entryDrums.support;
 const edges=[backZ,frontZ,...entrySections.map(s=>s.z).filter(z=>z>backZ&&z<frontZ)];
 for(let i=1;i<entrySections.length;i++){
  const a=entrySections[i-1],b=entrySections[i];
  if((a.halfWidth-innerX)*(b.halfWidth-innerX)>=0)continue;
  const z=a.z+(b.z-a.z)*(innerX-a.halfWidth)/(b.halfWidth-a.halfWidth);
  if(z>backZ&&z<frontZ)edges.push(z);
 }
 edges.sort((a,b)=>a-b);
 for(const side of [-1,1]){
  const vertices=[],indices=[];
  for(const z of edges){
   const inner=Math.max(innerX,templeEntranceWidth(z));
   const a=vertices.length;
   const [minX,maxX]=side<0?[-outerX,-inner]:[inner,outerX];
   vertices.push([minX,L.floorY,z],[maxX,L.floorY,z]);
   if(a)indices.push(a-2,a,a+1,a-2,a+1,a-1);
  }
  surfaces.push({id:side<0?'entry-drum-pad-west':'entry-drum-pad-east',vertices,indices});
 }
 return [...surfaces,...sideHallSurfaces(L),...foundationSurfaces(L)]; // Old cross-island walkway stays retired.

}
function templeTriangleHeight(surface,x,z){
 const v=surface.vertices,ids=surface.indices;for(let i=0;i<ids.length;i+=3){const a=v[ids[i]],b=v[ids[i+1]],c=v[ids[i+2]],den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-10)continue;
 const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,w=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,t=1-u-w;if(Math.min(u,w,t)>=-1e-7)return u*a[1]+w*b[1]+t*c[1];}return NaN;
}

// Generated by scripts/bake-room-contract.mjs from actual TempleWorld authoring. Do not hand edit.
const roomColliders={
  "source": {
    "worldSha256": "b3396a9a972741e5c211b7ba0caa2cb80aba63625b52022335f615236803ceb4",
    "layoutSha256": "b5cd114bdb4930c0de810043b1700a386dc6e060402a5db4654069a4a5765a94",
    "sideHallsSha256": "8c81795e0bc51470e760e42fd68bc0cc9b8af1abdd3908e6c8279741eab3d11a",
    "islandSha256": "b206259bd52ad637cc2d5a8fbbd25b080eddd337166f001b3a4eaaa484f7bc54",
    "entryFrameSha256": "a0e79ae48a69872e3d8afb8edc8a28dca8e4d851f067a7312182a9ecf1cd3da9",
    "interiorShellSha256": "9014fb9b9013ae1952169455c9362540ed95c858c1dbbab790bd3586c6bae6ba"
  },
  "obstacles": [
    {
      "x": -5.06,
      "z": 15.2,
      "hx": 0.26,
      "hz": 0.52,
      "label": "正门木作门柱"
    },
    {
      "x": -5.06,
      "z": 15.2,
      "hx": 0.22,
      "hz": 0.47,
      "label": "正门木作门柱"
    },
    {
      "x": 5.06,
      "z": 15.2,
      "hx": 0.26,
      "hz": 0.52,
      "label": "正门木作门柱"
    },
    {
      "x": 5.06,
      "z": 15.2,
      "hx": 0.22,
      "hz": 0.47,
      "label": "正门木作门柱"
    },
    {
      "x": -5.09,
      "z": 14.396,
      "hx": 0.29,
      "hz": 0.004,
      "label": "正门木作门柱"
    },
    {
      "x": 5.09,
      "z": 14.396,
      "hx": 0.29,
      "hz": 0.004,
      "label": "正门木作门柱"
    },
    {
      "x": -6.05,
      "z": 15.86,
      "hx": 0.48,
      "hz": 0.08,
      "label": "大殿门联"
    },
    {
      "x": 6.05,
      "z": 15.86,
      "hx": 0.48,
      "hz": 0.08,
      "label": "大殿门联"
    },
    {
      "x": -7.87,
      "z": 17.82,
      "hx": 0.629,
      "hz": 0.9572153734590283,
      "label": "大殿石鼓"
    },
    {
      "x": 7.87,
      "z": 17.82,
      "hx": 0.629,
      "hz": 0.9572153734590283,
      "label": "大殿石鼓"
    },
    {
      "x": -54,
      "z": 14.1125,
      "hx": 0.12,
      "hz": 7.487500000000001,
      "label": "小殿墙体"
    },
    {
      "x": -34,
      "z": 14.1125,
      "hx": 0.12,
      "hz": 7.487500000000001,
      "label": "小殿墙体"
    },
    {
      "x": -44,
      "z": 6.625,
      "hx": 10,
      "hz": 0.12,
      "label": "小殿墙体"
    },
    {
      "x": -54.3,
      "z": 22.85,
      "hx": 0.22,
      "hz": 0.22,
      "label": "小殿外柱"
    },
    {
      "x": -33.7,
      "z": 22.85,
      "hx": 0.22,
      "hz": 0.22,
      "label": "小殿外柱"
    },
    {
      "x": -50.47,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hz": 0.685,
      "label": "scripture joined facade wing -1"
    },
    {
      "x": -37.53,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hz": 0.685,
      "label": "scripture joined facade wing 1"
    },
    {
      "x": -46.52,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hz": 0.685,
      "label": "小殿门框"
    },
    {
      "x": -41.48,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hz": 0.685,
      "label": "小殿门框"
    },
    {
      "x": 34,
      "z": 14.1125,
      "hx": 0.12,
      "hz": 7.487500000000001,
      "label": "小殿墙体"
    },
    {
      "x": 54,
      "z": 14.1125,
      "hx": 0.12,
      "hz": 7.487500000000001,
      "label": "小殿墙体"
    },
    {
      "x": 44,
      "z": 6.625,
      "hx": 10,
      "hz": 0.12,
      "label": "小殿墙体"
    },
    {
      "x": 33.7,
      "z": 22.85,
      "hx": 0.22,
      "hz": 0.22,
      "label": "小殿外柱"
    },
    {
      "x": 54.3,
      "z": 22.85,
      "hx": 0.22,
      "hz": 0.22,
      "label": "小殿外柱"
    },
    {
      "x": 37.53,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hz": 0.685,
      "label": "tea joined facade wing -1"
    },
    {
      "x": 50.47,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hz": 0.685,
      "label": "tea joined facade wing 1"
    },
    {
      "x": 41.48,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hz": 0.685,
      "label": "小殿门框"
    },
    {
      "x": 46.52,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hz": 0.685,
      "label": "小殿门框"
    },
    {
      "x": -20.12,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hz": 14.975000000000001,
      "label": "西侧完整内墙"
    },
    {
      "x": 20.12,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hz": 14.975000000000001,
      "label": "东侧完整内墙"
    },
    {
      "x": 0,
      "z": -15.67,
      "hx": 20.24,
      "hz": 0.12,
      "label": "后侧完整内墙"
    },
    {
      "x": -12.52,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hz": 0.12,
      "label": "前侧完整内墙"
    },
    {
      "x": 12.52,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hz": 0.12,
      "label": "前侧完整内墙"
    },
    {
      "x": -7.829000000000001,
      "z": 14.312000000000001,
      "hx": 2.379,
      "hz": 0.075,
      "label": "Main hall open door leaf -1"
    },
    {
      "x": 7.829000000000001,
      "z": 14.312000000000001,
      "hx": 2.379,
      "hz": 0.075,
      "label": "Main hall open door leaf 1"
    },
    {
      "x": -10.4,
      "z": 3,
      "hx": 0.4,
      "hz": 0.4,
      "label": "正殿木柱"
    },
    {
      "x": -10.4,
      "z": 12.6,
      "hx": 0.4,
      "hz": 0.4,
      "label": "正殿木柱"
    },
    {
      "x": 10.4,
      "z": 3,
      "hx": 0.4,
      "hz": 0.4,
      "label": "正殿木柱"
    },
    {
      "x": 10.4,
      "z": 12.6,
      "hx": 0.4,
      "hz": 0.4,
      "label": "正殿木柱"
    },
    {
      "x": -13.2,
      "z": -15.366000000000001,
      "hx": 5.625,
      "hz": 0.225,
      "label": "Crowned Buddha ruyi screen"
    },
    {
      "x": 0,
      "z": -15.366000000000001,
      "hx": 6.665,
      "hz": 0.225,
      "label": "Central Buddha lotus screen"
    },
    {
      "x": 13.2,
      "z": -15.366000000000001,
      "hx": 5.625,
      "hz": 0.225,
      "label": "Guanyin lotus screen"
    },
    {
      "x": 0,
      "z": -10.4,
      "hx": 19.3,
      "hz": 5,
      "label": "Altar timber plinth body"
    },
    {
      "x": 0,
      "z": -4.1,
      "hx": 7.81,
      "hz": 0.425,
      "label": "供桌"
    },
    {
      "x": 0,
      "z": -3,
      "hx": 0.5,
      "hz": 0.49,
      "label": "香炉"
    },
    {
      "x": 44,
      "z": 9.4,
      "hx": 2.4,
      "hz": 2.24,
      "label": "财神供台"
    },
    {
      "x": 44,
      "z": 6.934,
      "hx": 3.675,
      "hz": 0.225,
      "label": "Caishen red lacquer screen"
    },
    {
      "x": 44,
      "z": 12.42,
      "hx": 2.7849999999999997,
      "hz": 0.63,
      "label": "财神殿供桌"
    },
    {
      "x": -9.2,
      "z": 15.45,
      "hx": 0.58,
      "hz": 0.58,
      "label": "殿外木柱"
    },
    {
      "x": -20.6,
      "z": 15.45,
      "hx": 0.58,
      "hz": 0.58,
      "label": "殿外木柱"
    },
    {
      "x": 9.2,
      "z": 15.45,
      "hx": 0.58,
      "hz": 0.58,
      "label": "殿外木柱"
    },
    {
      "x": 20.6,
      "z": 15.45,
      "hx": 0.58,
      "hz": 0.58,
      "label": "殿外木柱"
    },
    {
      "x": -48.6,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": -54.3,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": -39.4,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": -33.7,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": 39.4,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": 33.7,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": 48.6,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": 54.3,
      "z": 22.125,
      "hx": 0.29,
      "hz": 0.29,
      "label": "殿外木柱"
    },
    {
      "x": -9.4,
      "z": 22.2,
      "hx": 0.49,
      "hz": 0.49,
      "label": "庭院石灯"
    },
    {
      "x": 9.4,
      "z": 22.2,
      "hx": 0.49,
      "hz": 0.49,
      "label": "庭院石灯"
    },
    {
      "x": -22.9,
      "z": 22.2,
      "hx": 0.49,
      "hz": 0.49,
      "label": "庭院石灯"
    },
    {
      "x": 22.9,
      "z": 22.2,
      "hx": 0.49,
      "hz": 0.49,
      "label": "庭院石灯"
    },
    {
      "x": 8.8,
      "z": -2.7,
      "hx": 0.475,
      "hz": 0.43,
      "label": "木鱼"
    },
    {
      "x": -49.4,
      "z": 12.7,
      "hx": 1.6,
      "hz": 0.65,
      "label": "reading-table"
    },
    {
      "x": -38.5,
      "z": 16.8,
      "hx": 0.85,
      "hz": 0.5,
      "label": "library-tea-table"
    },
    {
      "x": -53.34,
      "z": 13.9125,
      "hx": 0.54,
      "hz": 7.137500000000001,
      "label": "scripture-west-to-ceiling"
    },
    {
      "x": -34.66,
      "z": 13.9125,
      "hx": 0.54,
      "hz": 7.137500000000001,
      "label": "scripture-east-to-ceiling"
    },
    {
      "x": -44,
      "z": 7.3149999999999995,
      "hx": 8.8,
      "hz": 0.54,
      "label": "scripture-rear-to-ceiling"
    },
    {
      "x": -50.4,
      "z": 13.7,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat read-front-0",
      "seatId": "read-front-0"
    },
    {
      "x": -50.4,
      "z": 11.7,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat read-back-0",
      "seatId": "read-back-0"
    },
    {
      "x": -48.4,
      "z": 13.7,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat read-front-1",
      "seatId": "read-front-1"
    },
    {
      "x": -48.4,
      "z": 11.7,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat read-back-1",
      "seatId": "read-back-1"
    },
    {
      "x": -39.71,
      "z": 16.8,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat library-tea-west",
      "seatId": "library-tea-west"
    },
    {
      "x": -37.29,
      "z": 16.8,
      "hx": 0.37,
      "hz": 0.33,
      "label": "Seat library-tea-east",
      "seatId": "library-tea-east"
    }
  ],
  "cameraObstacles": [
    {
      "x": -5.06,
      "y": 0.084,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.096,
      "hz": 0.52,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 4.09,
      "z": 15.2,
      "hx": 0.22,
      "hy": 3.91,
      "hz": 0.47,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 0.23,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.05,
      "hz": 0.505,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 8.1,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.1,
      "hz": 0.52,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.14,
      "hy": 3.66,
      "hz": 0.02,
      "label": "Main entry frame"
    },
    {
      "x": -5.215,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": -4.904999999999999,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 0.29,
      "z": 14.687999999999999,
      "hx": 0.195,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 7.945,
      "z": 14.687999999999999,
      "hx": 0.215,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.14,
      "hy": 3.66,
      "hz": 0.02,
      "label": "Main entry frame"
    },
    {
      "x": -5.215,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": -4.904999999999999,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 0.29,
      "z": 15.712,
      "hx": 0.195,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": -5.06,
      "y": 7.945,
      "z": 15.712,
      "hx": 0.215,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 0.084,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.096,
      "hz": 0.52,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 4.09,
      "z": 15.2,
      "hx": 0.22,
      "hy": 3.91,
      "hz": 0.47,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 0.23,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.05,
      "hz": 0.505,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 8.1,
      "z": 15.2,
      "hx": 0.26,
      "hy": 0.1,
      "hz": 0.52,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.14,
      "hy": 3.66,
      "hz": 0.02,
      "label": "Main entry frame"
    },
    {
      "x": 4.904999999999999,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": 5.215,
      "y": 4.12,
      "z": 14.713,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 0.29,
      "z": 14.687999999999999,
      "hx": 0.195,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 7.945,
      "z": 14.687999999999999,
      "hx": 0.215,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.14,
      "hy": 3.66,
      "hz": 0.02,
      "label": "Main entry frame"
    },
    {
      "x": 4.904999999999999,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": 5.215,
      "y": 4.12,
      "z": 15.687,
      "hx": 0.009,
      "hy": 3.635,
      "hz": 0.023,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 0.29,
      "z": 15.712,
      "hx": 0.195,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": 5.06,
      "y": 7.945,
      "z": 15.712,
      "hx": 0.215,
      "hy": 0.011,
      "hz": 0.0125,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.21,
      "z": 15.2,
      "hx": 5.32,
      "hy": 0.21,
      "hz": 0.52,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.22,
      "z": 14.645,
      "hx": 5.32,
      "hy": 0.14,
      "hz": 0.035,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.052,
      "z": 14.645,
      "hx": 5.26,
      "hy": 0.0175,
      "hz": 0.04,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.36,
      "z": 14.6,
      "hx": 5.22,
      "hy": 0.009,
      "hz": 0.009,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.22,
      "z": 15.754999999999999,
      "hx": 5.32,
      "hy": 0.14,
      "hz": 0.035,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.052,
      "z": 15.754999999999999,
      "hx": 5.26,
      "hy": 0.0175,
      "hz": 0.04,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.36,
      "z": 15.799999999999999,
      "hx": 5.22,
      "hy": 0.009,
      "hz": 0.009,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.48,
      "z": 15.2,
      "hx": 5.32,
      "hy": 0.06,
      "hz": 0.56,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 9.04,
      "z": 15.245,
      "hx": 5.38,
      "hy": 0.5,
      "hz": 0.91,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 9.585,
      "z": 15.245,
      "hx": 5.4399999999999995,
      "hy": 0.045,
      "hz": 0.955,
      "label": "Main entry frame"
    },
    {
      "x": -5.32,
      "y": 4.264,
      "z": 15.225,
      "hx": 0.09,
      "hy": 4.276,
      "hz": 0.63,
      "label": "Main entry frame"
    },
    {
      "x": 5.32,
      "y": 4.264,
      "z": 15.225,
      "hx": 0.09,
      "hy": 4.276,
      "hz": 0.63,
      "label": "Main entry frame"
    },
    {
      "x": -7.1899999999999995,
      "y": 0.228,
      "z": 15.01,
      "hx": 1.8,
      "hy": 0.24,
      "hz": 0.48,
      "label": "Main entry frame"
    },
    {
      "x": -7.1899999999999995,
      "y": 4.228,
      "z": 15.01,
      "hx": 1.8,
      "hy": 3.76,
      "hz": 0.45,
      "label": "Main entry frame"
    },
    {
      "x": 7.1899999999999995,
      "y": 0.228,
      "z": 15.01,
      "hx": 1.8,
      "hy": 0.24,
      "hz": 0.48,
      "label": "Main entry frame"
    },
    {
      "x": 7.1899999999999995,
      "y": 4.228,
      "z": 15.01,
      "hx": 1.8,
      "hy": 3.76,
      "hz": 0.45,
      "label": "Main entry frame"
    },
    {
      "x": -5.09,
      "y": 0.129,
      "z": 14.396,
      "hx": 0.29,
      "hy": 0.14100000000000001,
      "hz": 0.004,
      "label": "Main entry frame"
    },
    {
      "x": -5.09,
      "y": 4.404999999999999,
      "z": 14.396,
      "hx": 0.29,
      "hy": 4.135,
      "hz": 0.004,
      "label": "Main entry frame"
    },
    {
      "x": -5.345,
      "y": 4.404999999999999,
      "z": 14.391100000000002,
      "hx": 0.024,
      "hy": 4.135,
      "hz": 0.0009,
      "label": "Main entry frame"
    },
    {
      "x": -4.874,
      "y": 4.16625,
      "z": 14.391100000000002,
      "hx": 0.0135,
      "hy": 3.89625,
      "hz": 0.0009,
      "label": "Main entry frame"
    },
    {
      "x": 5.09,
      "y": 0.129,
      "z": 14.396,
      "hx": 0.29,
      "hy": 0.14100000000000001,
      "hz": 0.004,
      "label": "Main entry frame"
    },
    {
      "x": 5.09,
      "y": 4.404999999999999,
      "z": 14.396,
      "hx": 0.29,
      "hy": 4.135,
      "hz": 0.004,
      "label": "Main entry frame"
    },
    {
      "x": 5.345,
      "y": 4.404999999999999,
      "z": 14.391100000000002,
      "hx": 0.024,
      "hy": 4.135,
      "hz": 0.0009,
      "label": "Main entry frame"
    },
    {
      "x": 4.874,
      "y": 4.16625,
      "z": 14.391100000000002,
      "hx": 0.0135,
      "hy": 3.89625,
      "hz": 0.0009,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.27,
      "z": 14.396,
      "hx": 4.8,
      "hy": 0.27,
      "hz": 0.004,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 8.076,
      "z": 14.391100000000002,
      "hx": 4.887499999999999,
      "hy": 0.0135,
      "hz": 0.0009,
      "label": "Main entry frame"
    },
    {
      "x": 0,
      "y": 9.67,
      "z": 16.275,
      "hx": 6.1,
      "hy": 1.1,
      "hz": 0.125,
      "label": "Main bilingual plaque"
    },
    {
      "x": -6.05,
      "y": 4.93,
      "z": 15.86,
      "hx": 0.48,
      "hy": 3.07,
      "hz": 0.084,
      "label": "Main hall couplet"
    },
    {
      "x": 6.05,
      "y": 4.93,
      "z": 15.86,
      "hx": 0.48,
      "hy": 3.07,
      "hz": 0.084,
      "label": "Main hall couplet"
    },
    {
      "x": -7.87,
      "y": 1.188,
      "z": 17.82,
      "hx": 0.629,
      "hy": 1.2,
      "hz": 0.9572153734590283,
      "label": "Main hall stone drum"
    },
    {
      "x": 7.87,
      "y": 1.188,
      "z": 17.82,
      "hx": 0.629,
      "hy": 1.2,
      "hz": 0.9572153734590283,
      "label": "Main hall stone drum"
    },
    {
      "x": -54,
      "y": 3.79,
      "z": 14.1125,
      "hx": 0.12,
      "hy": 3.79,
      "hz": 7.487500000000001,
      "label": "Room wall"
    },
    {
      "x": -34,
      "y": 3.79,
      "z": 14.1125,
      "hx": 0.12,
      "hy": 3.79,
      "hz": 7.487500000000001,
      "label": "Room wall"
    },
    {
      "x": -44,
      "y": 3.79,
      "z": 6.625,
      "hx": 10,
      "hy": 3.79,
      "hz": 0.12,
      "label": "Room wall"
    },
    {
      "x": -54.3,
      "y": 3.9499999999999997,
      "z": 22.85,
      "hx": 0.22,
      "hy": 2.85,
      "hz": 0.22,
      "label": "Pavilion facade column"
    },
    {
      "x": -33.7,
      "y": 3.9499999999999997,
      "z": 22.85,
      "hx": 0.22,
      "hy": 2.85,
      "hz": 0.22,
      "label": "Pavilion facade column"
    },
    {
      "x": -50.47,
      "y": 2.135,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hy": 2.135,
      "hz": 0.685,
      "label": "scripture joined facade wing -1"
    },
    {
      "x": -37.53,
      "y": 2.135,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hy": 2.135,
      "hz": 0.685,
      "label": "scripture joined facade wing 1"
    },
    {
      "x": -44,
      "y": 5.625,
      "z": 22.165000000000003,
      "hx": 10.3,
      "hy": 1.1749999999999998,
      "hz": 0.685,
      "label": "Pavilion upper facade"
    },
    {
      "x": -44,
      "y": 7.255,
      "z": 21.6,
      "hx": 10.12,
      "hy": 0.45500000000000007,
      "hz": 0.12,
      "label": "Pavilion timber ceiling wall return"
    },
    {
      "x": -46.52,
      "y": 2,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hy": 2,
      "hz": 0.685,
      "label": "Pavilion jamb"
    },
    {
      "x": -41.48,
      "y": 2,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hy": 2,
      "hz": 0.685,
      "label": "Pavilion jamb"
    },
    {
      "x": -44,
      "y": 4.135,
      "z": 22.165000000000003,
      "hx": 2.6399999999999997,
      "hy": 0.135,
      "hz": 0.685,
      "label": "Pavilion lintel"
    },
    {
      "x": -44,
      "y": 7.69,
      "z": 14.1125,
      "hx": 10.12,
      "hy": 0.11,
      "hz": 7.607500000000001,
      "label": "Pavilion ceiling"
    },
    {
      "x": 34,
      "y": 3.79,
      "z": 14.1125,
      "hx": 0.12,
      "hy": 3.79,
      "hz": 7.487500000000001,
      "label": "Room wall"
    },
    {
      "x": 54,
      "y": 3.79,
      "z": 14.1125,
      "hx": 0.12,
      "hy": 3.79,
      "hz": 7.487500000000001,
      "label": "Room wall"
    },
    {
      "x": 44,
      "y": 3.79,
      "z": 6.625,
      "hx": 10,
      "hy": 3.79,
      "hz": 0.12,
      "label": "Room wall"
    },
    {
      "x": 33.7,
      "y": 3.9499999999999997,
      "z": 22.85,
      "hx": 0.22,
      "hy": 2.85,
      "hz": 0.22,
      "label": "Pavilion facade column"
    },
    {
      "x": 54.3,
      "y": 3.9499999999999997,
      "z": 22.85,
      "hx": 0.22,
      "hy": 2.85,
      "hz": 0.22,
      "label": "Pavilion facade column"
    },
    {
      "x": 37.53,
      "y": 2.135,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hy": 2.135,
      "hz": 0.685,
      "label": "tea joined facade wing -1"
    },
    {
      "x": 50.47,
      "y": 2.135,
      "z": 22.165000000000003,
      "hx": 3.8300000000000005,
      "hy": 2.135,
      "hz": 0.685,
      "label": "tea joined facade wing 1"
    },
    {
      "x": 44,
      "y": 5.625,
      "z": 22.165000000000003,
      "hx": 10.3,
      "hy": 1.1749999999999998,
      "hz": 0.685,
      "label": "Pavilion upper facade"
    },
    {
      "x": 44,
      "y": 7.255,
      "z": 21.6,
      "hx": 10.12,
      "hy": 0.45500000000000007,
      "hz": 0.12,
      "label": "Pavilion timber ceiling wall return"
    },
    {
      "x": 41.48,
      "y": 2,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hy": 2,
      "hz": 0.685,
      "label": "Pavilion jamb"
    },
    {
      "x": 46.52,
      "y": 2,
      "z": 22.165000000000003,
      "hx": 0.12,
      "hy": 2,
      "hz": 0.685,
      "label": "Pavilion jamb"
    },
    {
      "x": 44,
      "y": 4.135,
      "z": 22.165000000000003,
      "hx": 2.6399999999999997,
      "hy": 0.135,
      "hz": 0.685,
      "label": "Pavilion lintel"
    },
    {
      "x": 44,
      "y": 7.69,
      "z": 14.1125,
      "hx": 10.12,
      "hy": 0.11,
      "hz": 7.607500000000001,
      "label": "Pavilion ceiling"
    },
    {
      "x": -20.12,
      "y": 0.619,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 0.631,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": -20.12,
      "y": 8.16,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 6.91,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": -20.12,
      "y": 15.21,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 0.13999999999999968,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": 20.12,
      "y": 0.619,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 0.631,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": 20.12,
      "y": 8.16,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 6.910000000000001,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": 20.12,
      "y": 15.21,
      "z": -0.5750000000000002,
      "hx": 0.12,
      "hy": 0.13999999999999968,
      "hz": 14.975000000000001,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 0.619,
      "z": -15.67,
      "hx": 20.24,
      "hy": 0.631,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 8.189213483146068,
      "z": -15.67,
      "hx": 20.24,
      "hy": 6.939213483146068,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 15.199313483146067,
      "z": -15.67,
      "hx": 20.24,
      "hy": 0.2091134831460666,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": -12.52,
      "y": 0.619,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 0.631,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": -12.52,
      "y": 8.227647058823528,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 6.977647058823529,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": -12.52,
      "y": 15.23774705882353,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 0.24754705882352823,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 12.52,
      "y": 0.619,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 0.631,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 12.52,
      "y": 8.227647058823528,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 6.977647058823529,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 12.52,
      "y": 15.23774705882353,
      "z": 14.52,
      "hx": 7.719999999999999,
      "hy": 0.24754705882352823,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 11.872647058823528,
      "z": 14.52,
      "hx": 4.8,
      "hy": 3.3326470588235297,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 15.345294117647057,
      "z": 14.52,
      "hx": 4.8,
      "hy": 0.13999999999999968,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 8.27,
      "z": 14.52,
      "hx": 4.8,
      "hy": 0.2699999999999996,
      "hz": 0.12,
      "label": "Independent perimeter wall"
    },
    {
      "x": 0,
      "y": 0.088,
      "z": -15.44,
      "hx": 20,
      "hy": 0.1,
      "hz": 0.11,
      "label": "Independent trim"
    },
    {
      "x": -4.819999999999999,
      "y": 4.14,
      "z": 14.92,
      "hx": 0.02,
      "hy": 3.86,
      "hz": 0.27999999999999936,
      "label": "Independent portalReturn"
    },
    {
      "x": -4.819999999999999,
      "y": 0.23,
      "z": 14.6675,
      "hx": 0.02,
      "hy": 0.05000000000000002,
      "hz": 0.02749999999999897,
      "label": "Independent portalReturn"
    },
    {
      "x": -4.819999999999999,
      "y": 0.09,
      "z": 14.66,
      "hx": 0.02,
      "hy": 0.09,
      "hz": 0.019999999999999574,
      "label": "Independent portalReturn"
    },
    {
      "x": 4.819999999999999,
      "y": 4.14,
      "z": 14.92,
      "hx": 0.02,
      "hy": 3.86,
      "hz": 0.27999999999999936,
      "label": "Independent portalReturn"
    },
    {
      "x": 4.819999999999999,
      "y": 0.23,
      "z": 14.6675,
      "hx": 0.02,
      "hy": 0.05000000000000002,
      "hz": 0.02749999999999897,
      "label": "Independent portalReturn"
    },
    {
      "x": 4.819999999999999,
      "y": 0.09,
      "z": 14.66,
      "hx": 0.02,
      "hy": 0.09,
      "hz": 0.019999999999999574,
      "label": "Independent portalReturn"
    },
    {
      "x": 0,
      "y": 8.05,
      "z": 14.66,
      "hx": 4.8,
      "hy": 0.05,
      "hz": 0.019999999999999574,
      "label": "Independent portalReturn"
    },
    {
      "x": -7.829000000000001,
      "y": 3.997,
      "z": 14.312000000000001,
      "hx": 2.379,
      "hy": 3.9699999999999998,
      "hz": 0.075,
      "label": "Main hall open door leaf -1"
    },
    {
      "x": -5.394,
      "y": 1.4561999999999997,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": -5.394,
      "y": 3.997,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": -5.394,
      "y": 6.537799999999999,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": 7.829000000000001,
      "y": 3.997,
      "z": 14.312000000000001,
      "hx": 2.379,
      "hy": 3.9699999999999998,
      "hz": 0.075,
      "label": "Main hall open door leaf 1"
    },
    {
      "x": 5.394,
      "y": 1.4561999999999997,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": 5.394,
      "y": 3.997,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": 5.394,
      "y": 6.537799999999999,
      "z": 14.251000000000001,
      "hx": 0.34,
      "hy": 0.2,
      "hz": 0.14100000000000001,
      "label": "Main hall door hinge"
    },
    {
      "x": -10.4,
      "y": 8,
      "z": 3,
      "hx": 0.4,
      "hy": 8,
      "hz": 0.4,
      "label": "Main hall column"
    },
    {
      "x": -10.4,
      "y": 8,
      "z": 12.6,
      "hx": 0.4,
      "hy": 8,
      "hz": 0.4,
      "label": "Main hall column"
    },
    {
      "x": 10.4,
      "y": 8,
      "z": 3,
      "hx": 0.4,
      "hy": 8,
      "hz": 0.4,
      "label": "Main hall column"
    },
    {
      "x": 10.4,
      "y": 8,
      "z": 12.6,
      "hx": 0.4,
      "hy": 8,
      "hz": 0.4,
      "label": "Main hall column"
    },
    {
      "x": -13.2,
      "y": 8.15,
      "z": -15.366000000000001,
      "hx": 5.625,
      "hy": 6.95,
      "hz": 0.225,
      "label": "Crowned Buddha ruyi screen"
    },
    {
      "x": 0,
      "y": 8.15,
      "z": -15.366000000000001,
      "hx": 6.665,
      "hy": 6.95,
      "hz": 0.225,
      "label": "Central Buddha lotus screen"
    },
    {
      "x": 13.2,
      "y": 8.15,
      "z": -15.366000000000001,
      "hx": 5.625,
      "hy": 6.95,
      "hz": 0.225,
      "label": "Guanyin lotus screen"
    },
    {
      "x": 0,
      "y": 0.5499999999999999,
      "z": -10.4,
      "hx": 19.3,
      "hy": 0.5499999999999999,
      "hz": 5,
      "label": "Altar timber plinth body"
    },
    {
      "x": 0,
      "y": 0.575,
      "z": -4.1,
      "hx": 7.75,
      "hy": 0.575,
      "hz": 0.375,
      "label": "Offering table"
    },
    {
      "x": 0,
      "y": 0.62,
      "z": -3,
      "hx": 0.5,
      "hy": 0.62,
      "hz": 0.49,
      "label": "Incense burner"
    },
    {
      "x": 44,
      "y": 1.2000000000000002,
      "z": 12.42,
      "hx": 0.29,
      "hy": 0.28,
      "hz": 0.29,
      "label": "Wealth incense burner"
    },
    {
      "x": 44,
      "y": 0.155,
      "z": 9.4,
      "hx": 2.4,
      "hy": 0.155,
      "hz": 2.24,
      "label": "财神供台"
    },
    {
      "x": 44,
      "y": 3.952,
      "z": 6.934,
      "hx": 3.675,
      "hy": 3.622,
      "hz": 0.225,
      "label": "Caishen red lacquer screen"
    },
    {
      "x": 44,
      "y": 3.8200000000000003,
      "z": 9.4,
      "hx": 2.4,
      "hy": 3.47,
      "hz": 2.24,
      "label": "财神像"
    },
    {
      "x": 44,
      "y": 0.46,
      "z": 12.42,
      "hx": 2.775,
      "hy": 0.46,
      "hz": 0.62,
      "label": "Wealth offering table"
    },
    {
      "x": -9.2,
      "y": 7.95,
      "z": 15.45,
      "hx": 0.58,
      "hy": 6.5,
      "hz": 0.58,
      "label": "Exterior column"
    },
    {
      "x": -20.6,
      "y": 7.95,
      "z": 15.45,
      "hx": 0.58,
      "hy": 6.5,
      "hz": 0.58,
      "label": "Exterior column"
    },
    {
      "x": 9.2,
      "y": 7.95,
      "z": 15.45,
      "hx": 0.58,
      "hy": 6.5,
      "hz": 0.58,
      "label": "Exterior column"
    },
    {
      "x": 20.6,
      "y": 7.95,
      "z": 15.45,
      "hx": 0.58,
      "hy": 6.5,
      "hz": 0.58,
      "label": "Exterior column"
    },
    {
      "x": -48.6,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": -54.3,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": -39.4,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": -33.7,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": 39.4,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": 33.7,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": 48.6,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": 54.3,
      "y": 3.975,
      "z": 22.125,
      "hx": 0.29,
      "hy": 3.25,
      "hz": 0.29,
      "label": "Exterior column"
    },
    {
      "x": -9.4,
      "y": 0.82,
      "z": 22.2,
      "hx": 0.54,
      "hy": 0.82,
      "hz": 0.54,
      "label": "Forecourt stone lantern"
    },
    {
      "x": 9.4,
      "y": 0.82,
      "z": 22.2,
      "hx": 0.54,
      "hy": 0.82,
      "hz": 0.54,
      "label": "Forecourt stone lantern"
    },
    {
      "x": -22.9,
      "y": 0.82,
      "z": 22.2,
      "hx": 0.54,
      "hy": 0.82,
      "hz": 0.54,
      "label": "Forecourt stone lantern"
    },
    {
      "x": 22.9,
      "y": 0.82,
      "z": 22.2,
      "hx": 0.54,
      "hy": 0.82,
      "hz": 0.54,
      "label": "Forecourt stone lantern"
    },
    {
      "x": 8.8,
      "y": 0.54,
      "z": -2.7,
      "hx": 0.475,
      "hy": 0.54,
      "hz": 0.43,
      "label": "Woodfish stand"
    },
    {
      "x": -49.4,
      "y": 0.37,
      "z": 12.7,
      "hx": 1.6,
      "hy": 0.37,
      "hz": 0.65,
      "label": "reading-table"
    },
    {
      "x": -38.5,
      "y": 0.35,
      "z": 16.8,
      "hx": 0.85,
      "hy": 0.35,
      "hz": 0.5,
      "label": "library-tea-table"
    },
    {
      "x": -53.34,
      "y": 3.08,
      "z": 13.9125,
      "hx": 0.54,
      "hy": 3.08,
      "hz": 7.137500000000001,
      "label": "scripture-west-to-ceiling"
    },
    {
      "x": -34.66,
      "y": 3.08,
      "z": 13.9125,
      "hx": 0.54,
      "hy": 3.08,
      "hz": 7.137500000000001,
      "label": "scripture-east-to-ceiling"
    },
    {
      "x": -44,
      "y": 3.08,
      "z": 7.3149999999999995,
      "hx": 8.8,
      "hy": 3.08,
      "hz": 0.54,
      "label": "scripture-rear-to-ceiling"
    },
    {
      "x": -50.4,
      "y": 0.21,
      "z": 13.7,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat read-front-0"
    },
    {
      "x": -50.4,
      "y": 0.21,
      "z": 11.7,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat read-back-0"
    },
    {
      "x": -48.4,
      "y": 0.21,
      "z": 13.7,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat read-front-1"
    },
    {
      "x": -48.4,
      "y": 0.21,
      "z": 11.7,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat read-back-1"
    },
    {
      "x": -39.71,
      "y": 0.21,
      "z": 16.8,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat library-tea-west"
    },
    {
      "x": -37.29,
      "y": 0.21,
      "z": 16.8,
      "hx": 0.37,
      "hy": 0.21,
      "hz": 0.33,
      "label": "Seat library-tea-east"
    }
  ]
};

// Shared terrain and collision rules for browser and authoritative server.

function templeStoneHeight(x,z){return islandHeight(x,z);}
const templeRampEndHeight=templeSceneLayout.ramp.endY;
const templeHallFloorHeight=templeSceneLayout.floorY;
function templeApproachHeight(z){return templeApproachProfileHeight(z);}
function templeIndoorArea(x,z){for(const q of templeSceneLayout.zones){const[a,b,c,d]=q.bounds;if(x>=a&&x<=b&&z>=c&&z<=d)return q.id;}return null;}
let structureCache=null;
let courtSurfaces,entrySurfaces,gardenSurfaceCache;
const movementObstacles=[...roomColliders.obstacles,...templeGardenLayout.tableObstacles,...templeGardenLayout.seatObstacles];
function templeGetStructure(){return structureCache??=[...templeStructureSurfaces(templeStoneHeight),...gardenSurfaces(templeStoneHeight)];}
function courtHeight(x,z){for(const s of courtSurfaces??=templeGetStructure().filter(s=>s.id.startsWith('court-'))){const y=templeTriangleHeight(s,x,z);if(Number.isFinite(y))return y;}return NaN;}
function entryHeight(x,z){for(const s of entrySurfaces??=templeGetStructure().filter(s=>s.id.startsWith('entry-'))){const y=templeTriangleHeight(s,x,z);if(Number.isFinite(y))return y;}return NaN;}
function foundationHeight(x,z){return sourceFoundationHeight(templeSceneLayout,x,z);}
function courtStand(x,z){return [[0,0],[-.34,0],[.34,0],[0,-.34],[0,.34]].every(([dx,dz])=>Number.isFinite(courtHeight(x+dx,z+dz))||(z+dz<26&&z+dz>=15.2&&Math.abs(x+dx)<=templeEntranceWidth(z+dz,'halfWidth')));}
function templeCanStand(x,z,ignoreSeatId=null){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 const L=templeSceneLayout,r=L.ramp,c=L.connector;
 // Solid original plinth edges stop the capsule before its centre penetrates
 // the stone. Doorways remain at the indoor datum; no invisible new stairs.
 const base=templeGroundHeight(x,z),radius=L.character.radius;
 for(const [dx,dz]of[[-radius,0],[radius,0],[0,-radius],[0,radius]]){
  const top=foundationHeight(x+dx,z+dz);
  if(Number.isFinite(top)&&Math.abs(top-base)>L.character.maxStep)return false;
 }
 const tree=L.props.wishingTree;if(Math.hypot(x-tree.position[0],z-tree.position[2])<tree.collisionRadius+L.character.radius)return false;
 for(const trunk of templeGardenLayout.treeObstacles)if(Math.hypot(x-trunk.x,z-trunk.z)<trunk.radius+L.character.radius)return false;
 for(const trunk of islandTrees)if(Math.hypot(x-trunk.x,z-trunk.z)<trunk.radius+L.character.radius)return false;
 for(const o of movementObstacles){
  if(ignoreSeatId&&o.seatId===ignoreSeatId)continue;
  const dx=x-Math.max(o.x-o.hx,Math.min(o.x+o.hx,x)),dz=z-Math.max(o.z-o.hz,Math.min(o.z+o.hz,z));
  if(dx*dx+dz*dz<L.character.radius*L.character.radius)return false;
 }
 if(templeIndoorArea(x,z))return true;
 if(Number.isFinite(foundationHeight(x,z)))return true;
 if(courtStand(x,z))return true;
 if(gardenCanStand(x,z,gardenSurfaceCache??=templeGetStructure().filter(s=>s.id.startsWith('garden-'))))return true;
 if(z>=L.entrance[0].z&&z<=r.startZ&&Math.abs(x)<=templeEntranceWidth(z,'walkHalfWidth'))return true;
 const pad=L.entryDrums.support;
 if(z>=pad.backZ&&z<=pad.frontZ&&Math.abs(x)>=pad.innerX&&Math.abs(x)<=pad.outerX&&
    [[0,0],[-radius,0],[radius,0],[0,-radius],[0,radius]].every(([dx,dz])=>Number.isFinite(entryHeight(x+dx,z+dz))))return true;
 if(Math.abs(x)<22&&z>-17&&z<19)return false;
 return islandCanStand(x,z);
}
function templeGroundHeight(x,z){
 if(templeIndoorArea(x,z))return templeHallFloorHeight;
 const fh=foundationHeight(x,z);if(Number.isFinite(fh))return fh;
 const ch=courtHeight(x,z);if(Number.isFinite(ch))return ch;
 const gh=gardenHeight(x,z,gardenSurfaceCache??=templeGetStructure().filter(s=>s.id.startsWith('garden-')));if(Number.isFinite(gh))return gh;
 const L=templeSceneLayout,c=L.connector;
 if(z>=15.2&&z<=L.ramp.startZ){const y=entryHeight(x,z);if(Number.isFinite(y))return y;}
 if(z>=9&&z<=15.2&&Math.abs(x)<=5.3)return templeHallFloorHeight;
 return templeStoneHeight(x,z)+.025;
}
function templeCanTravel(ax,az,bx,bz,ignoreSeatId=null){
 // Check every interval cut by room boundaries. Fixed-distance samples alone
 // can miss a narrow diagonal cut across an L-shaped doorway corner.
 if(Math.min(az,bz)<26&&Math.max(az,bz)>-5&&Math.min(Math.abs(ax),Math.abs(bx))<58){
  const ts=[0,1],dx=bx-ax,dz=bz-az;
  for(const q of templeSceneLayout.zones){const[a,b,c,d]=q.bounds;if(Math.abs(dx)>1e-10)for(const edge of[a,b]){const t=(edge-ax)/dx;if(t>0&&t<1)ts.push(t);}if(Math.abs(dz)>1e-10)for(const edge of[c,d]){const t=(edge-az)/dz;if(t>0&&t<1)ts.push(t);}}
  ts.sort((a,b)=>a-b);for(let i=1;i<ts.length;i++){const t=(ts[i-1]+ts[i])/2;if(!templeCanStand(ax+dx*t,az+dz*t,ignoreSeatId))return false;}
 }
 const C=templeSceneLayout.character,steps=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/C.travelSample));if(steps>100)return false;let previous=templeGroundHeight(ax,az);
 for(let i=0;i<=steps;i++){const x=ax+(bx-ax)*i/steps,z=az+(bz-az)*i/steps;if(!templeCanStand(x,z,ignoreSeatId))return false;const h=templeGroundHeight(x,z);if(!Number.isFinite(h)||Math.abs(h-previous)>C.maxStep)return false;previous=h;}return true;
}


window.TempleNavigation={PLAYER_MOTION,templeJumpHeight,templeRestFits,islandLandscape,islandHeight,islandVertexHeight,islandRadius,islandTrees,templeGardenLayout,roomColliders,templeSceneLayout,templeGetStructure,templeHallFloorHeight,templeIndoorArea,templeCanStand,templeGroundHeight,templeStoneHeight,templeRampEndHeight,templeApproachHeight,templeCanTravel};
})();
