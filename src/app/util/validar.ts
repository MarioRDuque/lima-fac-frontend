export class Numero {

    getPositivo(valor: any): number {
        //let valor = event.target.value;
        let numero: number = 0;
        if (!isNaN(valor)) {//si no es un numero ilegal
            numero = Number(valor);
            if (valor < 0) {
                numero = numero * (-1);
            }
        }
        return numero;
    }
}
