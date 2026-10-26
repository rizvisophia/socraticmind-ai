export const lessons = Object.freeze({
  anatomy: {title:'Anatomy · Blood circulation',initial:'Where does blood low in oxygen travel after it returns to the right side of the heart?',goal:'Explain blood flow through right heart, lungs, left heart, body, and distinguish oxygenated versus deoxygenated blood.',reference:'Body → venae cavae → right atrium → right ventricle → pulmonary arteries → lungs → pulmonary veins → left atrium → left ventricle → aorta → body.',steps:[
    ['What carries blood from the right ventricle toward the lungs?','The pulmonary arteries carry blood from the right ventricle to the lungs.'],
    ['What happens to blood in the lungs?','Blood releases carbon dioxide and picks up oxygen.'],
    ['Which side of the heart receives blood returning from the lungs?','The left atrium receives oxygenated blood through pulmonary veins.'],
    ['How does oxygenated blood reach the body?','The left ventricle pumps blood through the aorta to the body.']
  ]},
  richmond: {title:'U.S. History · Richmond',initial:'Why might Richmond have been strategically important to the Confederacy during the Civil War?',goal:'Identify Richmond as Confederate capital and explain manufacturing, transportation, and strategic importance without equating it to the entire Confederacy.',reference:'Richmond became the Confederate capital in 1861. Tredegar Iron Works produced military material, and rail connections contributed to its logistical importance.',steps:[
    ['What political role did Richmond serve beginning in 1861?','It served as the capital of the Confederacy.'],
    ['How might an ironworks facility affect a wartime city?','Tredegar Iron Works helped produce iron and military supplies.'],
    ['Why would railroads be important during wartime?','Rail routes helped move troops and supplies.'],
    ['Can you combine those factors into one explanation?','Its role as capital, industrial capacity, and rail links made Richmond strategically important.']
  ]},
  algebra: {title:'Mathematics · Algebra',initial:'To solve 2x + 3 = 11, what operation would you apply first to isolate the term containing x?',goal:'Solve 2x + 3 = 11 and verify x = 4 by substitution.',reference:'Subtract 3 from both sides: 2x = 8. Divide by 2: x = 4. Check: 2(4)+3=11.',steps:[
    ['After subtracting 3 from both sides, what equation remains?','2x = 8.'],
    ['What operation isolates x?','Divide both sides by 2.'],
    ['What value do you get for x?','x = 4.'],
    ['How can you check the answer?','Substitute x = 4: 2(4)+3=11.']
  ]},
  physics: {title:'Physics · Motion',initial:'If a cart moves at constant speed in a straight line, what do you predict about its acceleration?',goal:'Distinguish velocity and acceleration; constant velocity implies zero acceleration and zero net force.',reference:'Acceleration is change in velocity over time. Constant velocity in a straight line means zero acceleration and zero net force.',steps:[
    ['Does acceleration describe velocity itself or changes in velocity?','It describes how velocity changes over time.'],
    ['Is the velocity changing if speed and direction stay constant?','No, velocity is constant.'],
    ['What does that mean for acceleration?','Acceleration is zero.'],
    ['According to Newton’s second law, what is the net force?','Zero net force because F_net = ma and a = 0.']
  ]}
});
export function getLesson(id){return lessons[id] || null;}
