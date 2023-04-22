/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("exercises").del().then(function () {
        // Inserts seed entries
        return knex("exercises").insert([
            { exercise: '25 push ups' },
            { exercise: '25 crunches' },
            { exercise: '25 lunges' },
            { exercise: '12-15 V ups' },
            { exercise: '15 bridges' },
            { exercise: '15 Supermans' },
            { exercise: '15-20 crunches' },
            { exercise: '15-20seconds plank' },
            { exercise: '10 burpees' },
            { exercise: '10-12 reverse lunges' },
            { exercise: '15-20 push ups' },
            { exercise: '15 jump lunges' },
            { exercise: '10-12 crunches' },
            { exercise: '15-20 curtsy lunges' },
            { exercise: '10 burpees' },
            { exercise: '30 seconds planks' },
            { exercise: '30 squats' },
            { exercise: '15-20 jump lunges' },
            { exercise: '30-60 seconds run in place' },
            { exercise: '10-15 jump squats' },
            { exercise: '15-20 plank jacks' },
            { exercise: '20-30 knee tucks ' },
            { exercise: '10-15 backwards lunges' },
            { exercise: '8-12 plank up-downs' },
            { exercise: '20-30 seconds Lateral lunges' },
            { exercise: '20-30 seconds Skiers ' },
            { exercise: '20-30 seconds Side plank / each side' },
            { exercise: '20-30 seconds Lateral squats' },
            { exercise: '20-30 seconds crunches ' },
            { exercise: '8-12 burpees' },
            { exercise: '20-30 seconds high knees' },
            { exercise: '20-30 jump lunges ' },
            { exercise: '10-15 leg lifts' },
            { exercise: '10-15 push-ups ' },
            { exercise: '12-15 bridges ' },
            { exercise: '20-30 seconds side lunges' },
            { exercise: '20-30 seconds jump lunges ' },
            { exercise: '20-30 seconds planks' },
            { exercise: '8-15 burpees' },
            { exercise: '20-30 seconds wall sit' },
            { exercise: '20-30 seconds triceps dip' },
            { exercise: '20-30 seconds high knees' },
            { exercise: '20-30 seconds mountain climber' },
            { exercise: '20-30 seconds squat jump' },
            { exercise: '20-30 seconds curtsy lunges' },
            { exercise: '20-30 seconds jump lunges' },
            { exercise: '15-30 seconds push-ups' },
            { exercise: '20-30 seconds lateral planks' },
            { exercise: '12-15 bridges' }
        ]);
    });
};





