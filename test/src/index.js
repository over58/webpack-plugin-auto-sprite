
// const paths = require.context('./assets/icons', false, "\.png$")
// console.log(paths)
// const classPahts =cssFileStr.match(/\.(icon-[\d\w]+)/gi).map(x=>x.replace('.',''))
import './assets/css/common.css'
import './assets/css/sprite.css';

const cssRules = document.styleSheets[1].cssRules
console.log(cssRules)
const rootContainer = document.createElement('div')
rootContainer.setAttribute('id', 'root')

for (const item of cssRules) {
    const className = item.selectorText.replace('.',' icon ')
    
    const iconContainer = document.createElement('div')
    iconContainer.setAttribute('class','inline-flex flex-column p-10 border-1 m-10')
    
    const iconSpan = document.createElement('span')
    iconSpan.setAttribute('class', className)
    iconContainer.appendChild(iconSpan)
    
    const iconText = document.createElement('div')
    iconText.setAttribute('class', 'text-center bg-black mt-10 text-white')
    iconText.innerText = item.selectorText
    iconContainer.appendChild(iconText)
    
    rootContainer.appendChild(iconContainer)
}

document.body.appendChild(rootContainer)



