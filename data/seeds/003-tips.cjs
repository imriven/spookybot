/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("tips").del().then(function () {
        // Inserts seed entries
        return knex("tips").insert([
          {
            title: "Don't skip weights!",
            content: "Some people feel like they don't want to start lifting weights until they're in better shape or skip them altogether because they don't want to bulk  up. \n" +
              '    \n' +
              "Weight lifting is one of the most efficient ways of losing weight. Not only can it include cardio but you also jump start your metabolism and you'll experience afterburn! \n" +
              '\n' +
              'Afterburn means you are burning calories after your workout from  muscles being repaired, it takes calories to do this! Weightlifting and resistance training has also been linked to not only slowing the aging process but also with reversing some on a genetic level. \n' +
              '\n' +
              "One common myth is that you will bulk up when you weight-lift. It takes a lot of specific foods at specific times of the day to effectively bulk up. It's really a science! So next time you are looking for an effective workout give weightlifting some attention! Your body will thank you!!!"
          },
          {
            title: 'You are what you eat',
            content: "If your goal is weight loss did you know that 80% has to do with diet and the other 20% is exercise. Diet is very important and should be the main focus and exercise is secondary. Calorie counting is helpful for managing intake. Don't sabotage your hard work!"
          },
          {
            title: 'No weights or workout equipment? No problem',
            content: 'Your body weight is the most efficient, inexpensive, and space saving equipment you need.There are hundreds of body weight exercises focused on core, upper and lower body, and cardio.You can get an effective full body workout just using you!'
          },
          {
            title: 'Only have a few minutes to workout?',
            content: 'If youre looking for efficient but quick workouts give HIIT and Tabata workouts a try.Both types of workouts demand bursts of intense exercise with quick breaks in between.Give them a try, even ten minutes will feel like you got a full workout!'
          },
          {
            title: 'Its in the way that you use it',
            content: 'Weights are great for weight loss or for toning up and building muscle.For more of an aerobic workout choose lighter weights and higher reps.To build muscle use heavier weights and lower reps.'
          },
          {
            title: 'Proteins are important',
            content: "Protein is responsible for the growth and repair of the body's tissues.They also play an essential role in the production of hormones, enzymes, and red blood cells. \n" +
              '\n' +
              "They are especially important for post workout.You can find sources of protein in meat, fish, and eggs, or plant based sources as well.Protein also keeps the body more satiated so you'll be less likely to snack in between meals."
          },
          {
            title: 'Looking for a challenge?',
            content: "If you're looking to make your weight lifting sessions more interesting try drop sets, supersets, or giant sets. \n" +
              '\n' +
              "A drop set is where you grab a set of heavy, medium, and light weights.You start out heavy until you can't lift anymore and drop down to medium and then to lightweight.Drop sets are very efficient in fatiguing your muscles.When performing to fatigue the muscle fibers grow by tearing and rebuilding. \n" +
              '\n' +
              'Supersets are taking two exercises and putting them together with no break in between.Normally you do a set of exercises and then take a quick break.If you are doing a superset of push - ups and sit - ups you would do your sit - ups and then push - ups and then take a quick break. Another benefit of supersets is you fit more exercises in a shorter amount of time. \n' +
              '\n' +
              "A giant set is the same idea as a superset but it's three or more exercises. \n" +
              '\n' +
              'Adding these techniques into your workout can also add an element of cardio in as well since it allows for less of a recovery period.They promote a more efficient and effective workout while switching up your routine!'
          },
          {
            title: 'How to stick to your health resolutions anytime of the year',
            content: "People tend to have an all or nothing outlook to getting healthy in the new year.But if you are trying to build lifelong habits here's some tips that might help. \n" +
              '    \n' +
              '1. Ease yourself into it \n' +
              'one reason people quit is they try to do too much too soon.Give yourself a chance to succeed! Make a plan.Introduce new habits to your life slowly and give yourself time to adjust.  \n' +
              '\n' +
              "2. Rest and cheat days are just as important as any other.Listen to your body! If you just started working out or if you are changing your eating habits it's good to rest and reward your hard efforts! \n" +
              '\n' +
              "3. It's ok to have an off day just pick yourself up and try again the next day.Making changes are hard.And everybody has bad days.The important thing is to not give up and give yourself a chance. \n" +
              '\n' +
              "4. When you decide you want to start being healthier don't wait.Some ppl will say oh I'll start in two weeks, I'll start the day after insert an event or day.But there really is no reason to wait.Start right then.Start planning and executing.  \n" +
              '\n' +
              'I hope these tips help to build those good habits you want to implement in your life!'
          },
          {
            title: 'Are you drinking enough water ?',
            content: 'Water is not only important for weightloss and exercise but is essential for everything your body does! Not drinking enough can effect the quality of your workouts and the effectiveness of your diet. \n' +
              '\n' +
              "FamilyDoctor.org says, “Good hydration means getting the right amount of water before, during, and after exercise.Water regulates your body temperature and lubricates your joints.It helps transport nutrients to give you energy and keep you healthy.If you're not hydrated, your body can't perform at its highest level.” \n" +
              '\n' +
              'While it is hard to keep track of your recommended 40 - 64 oz of water a day there are many tools that can help you! There are apps out there that will remind you when to take a water break. There are also smart tumblers and bottles that will light up and make noises when you need to drink! \n' +
              '\n' +
              "If water is too boring try a flavor enhancer.They come in all types of flavors! There are even jolly ranchers ones that aren't bad at all! \n" +
              '    '
          },
          {
            title: 'Embrace your DOMS',
            content: "You may or may not be familiar with DOMS but I'm sure you're familiar with post workout soreness.Ever workout and not feel it for a day or two ? DOMS stand for delayed onset muscle syndrome and can kick in anywhere from 24 to 72 hours after a workout! \n" +
              '    \n' +
              "DOMS come from the muscle tears that happen when you workout.While you feel this soreness your muscles are repairing.That's why it's always good to do splits to make sure you exercise different muscle groups so the sore ones have time to heal. \n" +
              '\n' +
              "Extra protein in your diet can help your muscles to repair themselves quicker.Hydration, stretching, and foam rollers can help too! Don't run from DOMs embrace them! It means what you are doing is working.Your body is changing."
          },
          {
            title: 'Challenge yourself with resistance bands',
            content: "So you want to work out at home but don't have the space and / or money for heavy duty equipment ? You might be surprised to know you don't need much to get a challenging and effective workout! Besides using your body weight for workouts adding resistance bands to your workout will give your body a new challenge!  \n" +
              '\n' +
              "Resistance bands are inexpensive, don't take up a lot of room and can be added to body weight workouts you may be doing already. \n" +
              '\n' +
              'There are several different types of resistance bands you can use to give you access to hundreds of exercises! \n' +
              '\n' +
              "There is an ample array of YouTube videos that use resistance bands in fun and challenging ways so you'll never get bored with your workout!"
          },
          {
            title: "It may be small but it's powerful",
            content: "I'm talking about eggs! They are compact, easy to carry around and are a protein power house! They have the ability to keep you satiated for hours and they can be cooked up many ways! There's too many benefits to list here but eggs are great and easy to add to many dishes! If you're ever looking for a protein boost or a post workout snack give an egg a try!"
          },
          {
            title: "Don't be targeted and become a victim",
            content: "As a consumer you have a target on your back.Idk if you've noticed health food trends marketed to make you buy.Trendy terms like “superfood”, “charcoal activated”, “metaboliser ”, etc etc are used to make you think you are making healthier choices.One thing that never changes is the food pyramid.It's very handy when trying to figure out what you should be eating and how much.So before you lament over whether to use olive oil, avocado oil, or coconut oil, just note they are about the same amount of calories and all have different cooking smoke points.Everything in moderation.Too much of anything is bad for you!"
          },
          {
            title: 'The importance of a heart rate monitor',
            content: 'Heart rate monitors are handy little tools especially when your are beginning your fitness journey. \n' +
              '    \n' +
              'They can tell you when you need to ease up until your heart rate goes down. This is important because it tells you what your limits are. \n' +
              '\n' +
              "Subsequently the can also tell you when you aren't working hard enough. As you continue your fitness adventure your body gets use to it and your heart becomes more efficient so you can start pushing yourself a little harder! It can even make weight lifting more cardio forward! \n" +
              '\n' +
              "If you can invest in one it's a great tool to have in your wheelhouse. If not always listen to the cues of your body! Don't push yourself too hard but make sure you are pushing hard enough! "
          },
          {
            title: 'Salmon the super fish!!',
            content: 'Not only is salmon super versatile and tasty, it can also help with post workout inflammation effectively decreasing muscle soreness. It also comes packed with protein to aid with repairing and building muscle fibers. \n' +
              '    \n' +
              'Salmon is rich in omega fatty acids, b vitamins, and protein. It can be broiled, poached, grilled, baked, steamed,  seared, and etc. Try 4oz of smoked salmon with a boiled egg or two for breakfast! This protein fueled breakfast will power you through ur morning! Try salmon chunks to give your lunch time salad a protein boost! For a quick dinner smother your salmon fillet with scallions, tomatoes, peppers, mushrooms or whatever veggies you can fit in!! Bake and enjoy!'
          },
          {
            title: "Wellness isn't just about your physical health",
            content: 'Did you know there are several "dimensions of wellness" that contribute to your overall well being? Wellness is a blanket term for everything around us that affects us. It includes physical, emotional, financial, vocational, social, intellectual, environmental, and spiritual wellness. \n' +
              '    \n' +
              "Physical Wellness is what I primarily focus on here in this discord! Physical Wellness is the ability to get your body to function at it's most optimal state. We may see health and fitness as ways to look and feel better but the body is a machine with different systems running. When you don't take care of a machine or are hard on it, it breaks down. \n" +
              '\n' +
              "Emotional Wellness is about self-image, your reactions to experiences, and your ability to cope and adapt. Spiritual wellness is about your beliefs, principles and values that guides you through life. Intellectual Wellness encourages curiousity, empathy, and creativity. It's allowing your mentality to expand through experiences and acquired knowledge. Environmental Wellness almost goes hand in hand with physical wellness. External factors have a direct influence on your physical and emotional well being. This could be natural like weather or the quality of home life. \n"
          },
          {
            title: 'Take a break',
            content: "We tend to have this an unhealthy mentality that you can't be successful without grinding at everything. But the truth is whatever you're reaching for will be hard to acheieve without allowing yourself to have a break! This is true with everything, health & fitness, occupations and careers, education, gaming, etc. Not only does a break help you to reset emotionally, physically, and mentally, they also serve as motivation towards the next reward or break. Setting goals and rewarding yourself for reaching those goals are an excellent way of keeping you motivated without grinding yourself into the ground!"
          }
        ]);
    });
};
