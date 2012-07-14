CC=pdflatex
BIB=bibtex
TEXF=sigproc-sp.tex
AUX=sigproc-sp.aux

all: paper

paper:
	$(CC) $(TEXF)
	$(BIB) $(AUX)
	$(CC) $(TEXF)
	$(CC) $(TEXF)

clean:
	rm -f *.aux *.log
