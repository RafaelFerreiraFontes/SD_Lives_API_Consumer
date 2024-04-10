require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const corsHeaders = {
    'Authorization': process.env.AUTHORIZATION || "" ,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization',
}

app.get('/', (req, res) => {
    res.send("SD Lives API Consumer Mercado Pago, please send a Post or Get Request.\n Get:/:id_pix \n Post:/:x_idempotency_key")
})

app.get('/:id_pix', async (req, res) => {
    const id_pix = req?.params?.id_pix ;

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id_pix}`, {
        headers: {...corsHeaders}
    })

    const res_json = await response.json()
    
    res.send(res_json)

    //console.log(corsHeaders, '\n', id_pix)
})

app.post('/:x_idempotency_key', async (req, res) => {

    console.log(req.params,"\n", req.body);

    if(req?.params?.x_idempotency_key == undefined || req?.body == undefined)
    {
        res.status(400).send({
            "messange": "Request Params or Resquest Body is undefined",
            "body": {...req?.body}
        })
    }
    else
    {

        const req_body = req.body

        const x_idempotency_key = req.params?.x_idempotency_key
        
        console.log(x_idempotency_key,"\n" ,req_body)

        const transaction_amount = req_body?.transaction_amount;

        const email = req_body?.payer?.email

        const first_name = req_body?.payer?.first_name

        const last_name = req_body?.payer?.last_name

        const identification_type = req_body?.payer?.identification?.type

        const identification_number = req_body?.payer?.identification?.number

        if(transaction_amount == undefined || email == undefined || first_name == undefined || last_name == undefined || identification_type == undefined || identification_type == undefined)
        {
            res.status(400).send({
                "messange": "Resquest Body is undefined",
                "body": {...req_body}
            })
        }
        else
        {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/`, {
            method: "POST",
            headers: {
                'Authorization': corsHeaders.Authorization,
                'X-Idempotency-Key': x_idempotency_key,
                'Access-Control-Allow-Origin': corsHeaders['Access-Control-Allow-Origin'],
                'Access-Control-Allow-Headers': 'Authorization, X-Idempotency-Key, Content-Type',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(
            {
                'transaction_amount': transaction_amount,
                'payment_method_id': 'pix',
                "payer": 
                    {
                        "email": email,
                    
                        "first_name": first_name,
                    
                        "last_name": last_name,
                    
                        "identification": 
                            {
                                "type": identification_type,
                                "number": identification_number
                            }
                    }
                })
            })
            
            if((await response).status != 200)
            {
                console.log((await response).status)
                console.log((await response).statusText)
            }

            let res_json = {
            "Response": (await response.json()),
            "Payer_Info": {
                "payer": 
                    {
                        "email": email,
                    
                        "first_name": first_name,
                    
                        "last_name": last_name,
                    
                        "identification": 
                            {
                                "type": identification_type,
                                "number": identification_number
                            }
                    }
                }
            }

            res.send(res_json).status(200)
        }

    }
})

/*app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user')
})
*/

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`)
})