course === Test
study lesson === examination

course => lesson => questionSet => question+prompt
delete prompt is deleted then unlink from questionSet
delete question is deleted then unlink from questionSet
delete questionSet is deleted then unlink from lesson/examination
delete lesson/examination is deleted then unlink from course
