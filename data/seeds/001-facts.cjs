/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex("facts").del().then(function () {
        // Inserts seed entries
        return knex("facts").insert([
          {
            content: "Tooth-in-the-Eye Surgery. Surgeons put a tooth in a blind person's eye to restore their sight. It was pioneered in the 1960s, and it actually works and it's still being done today"
          },
          { content: 'Real corpses were used in the 1982 film Poltergeist.' },
          {
            content: "There are bodies of over 150 dead hikers on Mount Everest, and they'are used as landmarks."
          },
          {
            content: 'The git is officially known as the only immortal creature in the world. It lives forever.'
          },
          {
            content: "A haunted radio station from Russia has been broadcasting a dull monotonous tone for twenty-four hours a day, seven days a week, for the last three-and-a-half decades. Every few seconds it's joined by a second sound, like some ghostly ship sounding its foghorn."
          },
          { content: 'Climate change is making spiders bigger.' },
          {
            content: 'Dogs like squeaky toys because they mimic the screams of their prey.'
          },
          { content: 'Spiders can survive in space.' },
          {
            content: 'Two Scottish surgeons originally invented the chainsaw to assist childbirth.'
          },
          {
            content: 'Locked-In Syndrome is a condition in which a patient is fully aware but is stuck in a coma-like state.'
          },
          {
            content: "The film 'A Nightmare on Elm Street' is based on a real story reported in the LA Times. A boy was terrified to go to sleep, and when he did, he died while screaming about a nightmare."
          },
          {
            content: "While Ted Bundy was a psychology major at the University of Washington, he worked at Seattle's Suicide Hotline Crisis Center."
          },
          {
            content: 'When you die the last sense to leave your body is the ability to hear.'
          },
          {
            content: "Ducklings can engage in cannibalistic behaviors when they're bored."
          },
          {
            content: 'More than 80% of our ocean is unmapped, unobserved, and unexplored.'
          },
          {
            content: "Technically it's not impossible to die from holding in a sneeze. Some injuries from holding in a sneeze can be very serious, such as ruptured brain aneurysms, ruptured throat, and collapsed lungs."
          },
          {
            content: 'Horned Lizards can defend themselves by squirting blood out of their eyes.'
          },
          {
            content: 'Alien hand syndrome is a phenomenon in which one hand is not under control of the mind. The person loses control of the hand, and it acts as if it has a mind of its own.'
          },
          {
            content: 'Some ants turn into zombies via parasitic fungus which manipulates their brains.'
          },
          {
            content: 'King Charles II drank alcohol mixed with pulverized human skulls.'
          },
          {
            content: 'Arrhythmic death syndrome is a sudden condition where someone seemingly healthy dies suddenly with no apparent cause of death.'
          },
          { content: '250,000 deaths a year are due to medical errors.' },
          {
            content: 'During the mummification process, Ancient Egyptians remove the brain through one of the nostrils.'
          },
          {
            content: "People with Cotard's syndrome believe that parts of their body are missing, or that they are dying, dead, or don't exist. They may think nothing exists."
          },
          {
            content: "Criminologists estimate that there's a 1-in-3 chance police will never identify your killer if you're murdered in the US."
          },
          {
            content: 'Fatal familial insomnia makes it impossible for someone to sleep for months.'
          },
          {
            content: "You're more likely to die on your birthday. The chance someone will die on their birthday is 6.7 percent, which is higher than any other day."
          },
          {
            content: 'Some female spiders allow their young to eat them alive.'
          },
          {
            content: "doctors have found a fir tree growing in a man's lungs."
          },
          {
            content: 'A chicken named Mike lived for 8 weeks after his head was cut off.'
          },
          { content: 'A group of crows is called a murder.' },
          {
            content: 'Crows have also been known to seek revenge on people that have wronged them'
          },
          {
            content: 'The Catacombs under Paris hold the rains of roughly sixty million plague victims.'
          },
          {
            content: 'Ancient Britons often used human skulls as cups and bowls.'
          },
          {
            content: "In the Middle Ages, people used to eat mummies for medicinal purposes. It's the main reason we do not have a lot of mummies left today."
          },
          { content: 'You share 80 million bacteria in a single kiss. ' },
          {
            content: "In the 1920's, the American domestic terror group the Ku Klux Klan had a youth chapter called the “Ku Klux Kiddies.”"
          },
          {
            content: 'A rat king is a bunch of rats that are tangled together by their tails. In a similiar situation is a squirell king.'
          },
          {
            content: 'The former chief of the FBI estimates that there are between 25 and 50 active serial killers in America at any given time.'
          },
          {
            content: 'The Pirates of The Caribbean ride at Disneyland used to have real skeletons as props.'
          },
          {
            content: 'Syphilis left untreated leaves people looking like zombies. During the renaissance, hordes of untreated people with syphilis used to wander through the streets.'
          },
          {
            content: 'In 2008 a man living in rural Japan noticed his food disappearing at night. When he installed cameras, they revealed a woman had been living in his house. At the time of her discovery, she had been living there for months.'
          },
          {
            content: 'Dennis Radner, aka the BTK killer, profited off his own derangement. He got a lot of business installing security systems for people afraid of the BTK killer.'
          },
          { content: "A rat's teeth never stop growing." },
          {
            content: 'Cosmologists theorize the constant expansion of the universe could cause it to tear apart. This theory is called The Big Rip.'
          },
          {
            content: "The Voynich Manuscript is an ancient book full of strange symbols no one can translate. It's full of strange symbols, drawings and letters."
          },
          {
            content: 'In 1872 the ship Mary Celest was discovered floating in the ocean with no signs of its crew or passengers! The ship was in good condition with no signs of damage except a bit of water at the bottom. What happened to the passengers on board?'
          },
          {
            content: "In 897AD, A dead Pope was once put on trial Pope Formosus was put on trial for perjury and other crimes. He'd been dead for a year! He was dug up and taken to court for questioning..."
          },
          {
            content: "Jeremy Bentham, an 18th century philosopher, scholar and one of the founders of UCL, died in 1832. But that didn't stop him continuing to attend council meetings - his skeleton can now be found in the halls of UCL., dressed up in his clothes and stuffed with straw, and has been in attendance at UCL council meetings on at least one recorded occasion, in 2013. In the meeting notes he is recorded as 'Present, but not voting'."
          },
          {
            content: 'Horned Lizards squirt blood from their eyes. This act is a way to freak out predators.'
          },
          {
            content: 'The Mummies of Guanajuato may have been buried alive. These mummies are famous for their horrible, dramatic facial expressions and date back to a 19th century Cholera epidemic.'
          },
          {
            content: "Loch Morar is home to 'Morag', another lake monster who's been sighted many times over the years. Some people think there may even be underground tunnels between the two lochs, and that Nessie and Morag are one and the same!"
          },
          {
            content: "The New England Vampire Panic occurred in the 19th century. These so called 'vampires' were actually suffering from tuberculosis."
          },
          {
            content: "Dracula is based on a historical figure, Vlad Tepes, or Vlad Dracula, who was a Romanian ruler in the 15th century who liked to stick his enemies on spikes. His nickname was Vlad the Impaler. The 'Dracula' in his original name means ' son of the dragon' (Dracul being his dad's nickname), and refers to his fearsome reputation."
          },
          {
            content: 'Cockroaches can live without their heads for weeks but will ultimately die when they need food or water'
          }
        ]);
    });
};
