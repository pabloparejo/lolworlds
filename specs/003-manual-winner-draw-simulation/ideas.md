1. Deberíamos tener alguna forma de guardar una ronda, donde podamos definir manualmente los enfrentamientos, para que cuando vaya avanzando el torneo, podamos definir los enfrentamientos que se dieron realmente, en lugar de siempre simularlos aleatoriamente.
   Detalle:
     Inicialmente, solo sabremos los equipos que van al mundial. En este caso, solo tendríamos definidos los equipos, pero no los enfrentamientos. En esta fase, podríamos simular el sorteo aleatoriamente (manteniendo las reglas del suizo de Riot, donde los equipos de la misma región no pueden enfrentarse en la primera ronda). Tras mostrar el sorteo al usuairo, el usuario podría avanzar a la siguiente fase, lo que haría: 
	   1. Simular los resultados de la ronda
	   2. Guardar la ronda con los enfrentamientos simulados
	   3. Crear una nueva ronda con enfrentamientos simulados para la siguiente fase, pero sin resultados
	 Luego, una vez que se realice el sorteo en la vida real, podríamos crear una "ronda" y definir los enfrentamientos manualmente. A partir de ahí, sería el mismo procedimiento: simular resultados, guardar la ronda con resultados, crear una nueva ronda para la siguiente fase sin resultados (aquí, los equipos de la misma región pueden enfrentarse, pero no se pueden repetir partidos anteriores).
	 Finalmente, tras los enfrentamientos del día X, podríamos crear otra "ronda" definiendo los enfrentamientos que se dieron realmente y crear una ronda nueva para tener los enfrentamientos del día X+1 (todavía sin resultado).
	 Esto nos permitiría tener el control total sobre los enfrentamientos que se dieron realmente, y así los usuarios podrán ver el desarrollo real del torneo, y continuar la simulación a partir de ahí.

2. Deberíamos ofrecer al usuario 2 tipos de reset:
  Reset completo: que borre todas las rondas y vuelva al estado inicial (solo con los equipos clasificados)
  Reset parcial: que borre todas las rondas hasta llegar a la última ronda que fue definida manualmente por el sistema (ie: si los últimos enfrentamientos han sido día 2 y ya tenemos el sorteo del día 3, al hacer reset parcial, se borrarían todas las rondas hasta el día 2, manteniendo el sorteo del día 3 sin resultados para que el usuario pueda simular desde ahí)

3. Deberíamos permitir al usuario modificar la ronda actual (la ronda que ha sido sorteada pero no simulada todavía) para poder definir manualmente el ganador de una ronda.
   Detalle:
	 En la ronda actual, el usuario debería poder hacer click en un equipo para definirlo como ganador del enfrentamiento. Este resultado se mantendrá así aunque el usuario simule la ronda (es decir, el equipo definido como ganador siempre ganará el enfrentamiento).
	 Si el usuario ha seleccionado todos los resultados para la ronda actual, podríamos cambiar el botón de "Simular ronda" por "Avanzar ronda", que simplemente avanzaría a la siguiente ronda sin simular nada (ya que todos los resultados han sido definidos manualmente).
	 Esto permitiría a los usuarios tener un control total sobre los resultados de los enfrentamientos, y así podrían ver cómo se desarrollaría el torneo con los resultados reales o con los resultados que ellos mismos definan.
