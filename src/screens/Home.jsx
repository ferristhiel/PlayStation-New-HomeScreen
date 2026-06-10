import {items} from '../data/catalog.js'

export default function Home(){
return <section className="home">
<h1>Welcome</h1>
<div className="shelf">
{items.map(x=><article className="tile" key={x.id} style={{'--a':x.a,'--b':x.b}}><b>{x.title.slice(0,2)}</b><span>{x.title}</span></article>)}
</div>
<div className="panel"><h2>Ferris Game</h2><p>Installed · Ready to play</p><button>Start</button><button>Details</button></div>
</section>
}
