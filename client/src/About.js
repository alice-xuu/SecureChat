function About() {

    const garble = ["leverage agile frameworks to provide a robust synopsis for high level overviews.",
    "iterate approaches to corporate strategy and foster collaborative thinking to further the overall value proposition.",
    "organically grow the holistic world view of disruptive innovation via workplace change management and empowerment.",
    "bring to the table win-win survival strategies to ensure proactive and progressive competitive domination.",
    "ensure the end of the day advancement, a new normal that has evolved from epistemic management approaches and is on the runway towards a streamlined cloud solution.",
    "provide user generated content in real-time will have multiple touchpoints for offshoring."]

    function getGarble() {
        return garble[Math.floor(Math.random() * garble.length)]
    }

    return (
        <div className="row pt-5 text-center align-items-center">
            <div className="col-sm-12 my-auto">
                <p>We're a group of threatening web-dev game changers who are commoditising opportunity pipelines and reorthogonalising boost up-sell messages before getting out of bed each day.
                <br/>In our team we have: 
                <br/><b>Joe User:</b> Our humble software farmer
                <br/><b>Jane Admin:</b>  Our professional software horticulturist
                </p>

                <p>
                And together we're here to {getGarble()}
                </p>
            </div>
        </div>
    );
}

export default About;