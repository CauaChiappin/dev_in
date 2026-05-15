<?php

class ApiError extends Exception {

    public $statusCode;
    public $detalhes;

    public function __construct(
        $mensagem,
        $statusCode = 500,
        $detalhes = null
    ) {

        parent::__construct($mensagem);

        $this->statusCode = $statusCode;
        $this->detalhes = $detalhes;
    }

    public function toJSON() {

        return [

            'sucesso' => false,
            'mensagem' => $this->getMessage(),
            'statusCode' => $this->statusCode,
            'detalhes' => $this->detalhes
        ];
    }
}