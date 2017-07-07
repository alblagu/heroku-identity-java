angular.module("app")
	.controller("prestamoController", function ($scope, $http) {
		$scope.NUM_MAX_PRESTAMOS=3;
		$scope.dni = "";
		$scope.codigo = "";
		$scope.textoError = "";
		
		
		$scope.fechaFin = new Date();
		$scope.fechaFin.setSeconds(14 * 86400); //Añado el tiempo
		$scope.textoErrorFecha="";
		
		$scope.fechaMinima=function(){
			var fechaMinima=new Date();
			fechaMinima.setSeconds(14 * 86400);
			var mes=fechaMinima.getMonth()+1;
			return fechaMinima.getDate()+"-"+mes+"-"+fechaMinima.getFullYear();
		};
	
		$scope.cancelar=function(){
			$scope.avanzar=false;
		};
		$scope.obtener = function () {
			$scope.textoError="";
			if ($scope.dni.length === 0 || $scope.codigo.length === 0){
				$scope.textoError = "Los campos no pueden estar vacios";
			}
			else {
				$http({
					method: 'GET',
					url: 'http://localhost:8080/Zinal/webresources/ejemplares/' + $scope.codigo
				}).then(function successCallback(response) {
					$scope.ejemplar = response.data;
					if(!$scope.ejemplar.disponible){
						$scope.textoError="Ese ejemplar no esta disponible";	
					}
					else{
					$http({
						method: 'GET',
						url: 'http://localhost:8080/Zinal/webresources/usuarios/usuario/' + $scope.dni
					}).then(function successCallback(response) {
						$scope.usuario = response.data;
						if($scope.usuario.tipoUsuario==='ADMIN'){
							$scope.textoError = "El administrador no puede tener prestamos";
						}
						else{
							$scope.comprobarMasXPrestamos();
						}
						
					},
						function errorCallback(response) {
							$scope.textoError = "No hay ningun usuario con ese dni";
						});
					}		
				},
					function errorCallback(response) {
						$scope.textoError = "No hay ningun ejemplar con ese codigo";
					});
				}
			};
		
		
		$scope.comprobarMasXPrestamos=function(){
			if($scope.usuario.tipoUsuario==='PROFESOR'){
				$scope.avanzar=true;
			}
			else{	
			$http({
				url: 'http://localhost:8080/Zinal/webresources/ejemplares/prestamosUsu/'+$scope.usuario.dni
		}).then(function successCallback(response) {
			if(response.data.length>=$scope.NUM_MAX_PRESTAMOS){
				$scope.textoError = "Ese ALUMNO ya tiene "+$scope.NUM_MAX_PRESTAMOS+" prestamos, No puede tener mas";
			}
			else{
				$scope.avanzar=true;
			}
			});
		}
		};

	

		
		$scope.nuevoPrestamo = function () {
			$scope.textoErrorFecha="";
			if($scope.fechaFin===null){
				$scope.textoErrorFecha="Seleccione una fecha";
			}
			else{
				if($scope.fechaFin.getDay()===6||$scope.fechaFin.getDay()===0){
					$scope.textoErrorFecha="El prestamo no puede acabar en finde semana";		
				}
				else{
					var fecha={
						dia:$scope.fechaFin.getDate(),
						mes:$scope.fechaFin.getMonth() + 1,
						anio:$scope.fechaFin.getFullYear()
					};
					

					$http({
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'POST',
						url: 'http://localhost:8080/Zinal/webresources/ejemplares/prestamos/'+$scope.dni+"/"+$scope.codigo,
						data: JSON.stringify(fecha)
					}).then(function successCallback(response) {

						alert("Se ha añadido un prestamo al ejemplar con el codigo " + $scope.codigo);
						location.reload();	
					});
				}
			}	
		};


	});
